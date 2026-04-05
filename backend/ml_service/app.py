# app.py  (updated, robust)
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import traceback

app = Flask(__name__)
CORS(app)

# ---------- Helpers ----------
def normalize_duty(duty_raw: str) -> str:
    if not duty_raw or pd.isna(duty_raw):
        return "Normal"
    s = str(duty_raw).strip().lower()
    if "night" in s:
        return "Night"
    if "extend" in s:
        return "Extended"
    if "stand" in s:
        return "Standby"
    return "Normal"

def to_float_safe(x):
    try:
        if isinstance(x, str):
            x = x.replace(",", "").strip()
        return float(x)
    except:
        return 0.0

def rule_score(totalFlightHours, restHours, consecNight, tz, segments, dutyType):
    h = to_float_safe(totalFlightHours)
    r = to_float_safe(restHours)
    n = to_float_safe(consecNight)
    z = to_float_safe(tz)
    s = to_float_safe(segments)
    duty = normalize_duty(dutyType)

    duty_map = {
        "Normal": 0.00,
        "Extended": 0.08,
        "Night": 0.12,
        "Standby": 0.04
    }

    score = (
        (h / 12.0) * 0.40 +
        (1.0 - (r / 72.0)) * 0.25 +
        (n / 5.0) * 0.15 +
        (z / 6.0) * 0.10 +
        (s / 6.0) * 0.05 +
        duty_map.get(duty, 0.0)
    )
    return float(np.clip(score, 0.0, 1.0))

def fatigue_level(score: float) -> str:
    if score >= 0.8:
        return "High"
    if score >= 0.5:
        return "Medium"
    return "Low"

# ---------- Load model ----------
try:
    model = joblib.load("model.pkl")
    print("Loaded model.pkl (hybrid model).")
except Exception as e:
    print("Failed to load model.pkl:", e)
    model = None

# ---------- Column name tolerance (case-insensitive) ----------
COLUMN_CANDIDATES = {
    "pilotId": ["pilot id","pilotid","pilot_id","id"],
    "fullName": ["full name","name","pilot name","fullname"],
    "date": ["date of duty","date","duty date","date_of_duty"],
    "start": ["flight duty start time","start","start_time","flight_start"],
    "end": ["flight duty end time","end","end_time","flight_end"],
    "totalFlightHours": ["total flight hours","totalflighthours","hours","flight_hours","air_time","airtime","total"],
    "restHours": ["rest hours","resthours","rest","sleep_hours","sleep duration","sleep duration","sleep duration"],
    "consecNight": ["consecutive night shifts","consecutive_night_shifts","consecnight","consec_night","night_shifts"],
    "tz": ["time zone changes","tz","tzchanges","timezone_changes","tz_changes"],
    "segments": ["flight segments","segments","flight_segments","num_segments"],
    "dutyType": ["duty type","dutytype","duty","shift_type","shift"]
}

def find_col(df, candidates):
    cols_map = {c.lower().strip(): c for c in df.columns}
    for cand in candidates:
        if cand.lower().strip() in cols_map:
            return cols_map[cand.lower().strip()]
    # try fuzzy/substring match
    for col_lower, real in cols_map.items():
        for cand in candidates:
            if cand.lower().strip() in col_lower:
                return real
    return None

def normalize_and_extract(df):
    out = pd.DataFrame()
    n = len(df)
    # for each logical column, try to find a match
    for logical, cand_list in COLUMN_CANDIDATES.items():
        found = find_col(df, cand_list)
        if found:
            out[logical] = df[found]
        else:
            # sensible defaults
            if logical in ["pilotId","fullName","date","start","end"]:
                out[logical] = ["" for _ in range(n)]
            elif logical == "dutyType":
                out[logical] = ["Normal" for _ in range(n)]
            else:
                out[logical] = [0 for _ in range(n)]

    # Ensure numeric columns are converted safely
    for col in ["totalFlightHours","restHours","consecNight","tz","segments"]:
        out[col] = pd.to_numeric(out[col], errors="coerce").fillna(0)

    out["dutyType"] = out["dutyType"].astype(str).apply(normalize_duty)

    # if pilotId blank, create index ids 001,002...
    if out["pilotId"].astype(str).str.strip().eq("").all():
        out["pilotId"] = [str(i+1).zfill(3) for i in range(n)]
    else:
        out["pilotId"] = out["pilotId"].astype(str)

    return out

# ---------- /predict (JSON) ----------
@app.route("/predict", methods=["POST"])
def predict_endpoint():
    try:
        payload = request.get_json() or {}
        rows = payload.get("rows", [])
        if not rows:
            return jsonify({"predictions":[]})
        df = pd.DataFrame(rows)
        data = normalize_and_extract(df)

        # rule
        data["ruleScore"] = data.apply(lambda r: rule_score(
            r["totalFlightHours"], r["restHours"], r["consecNight"], r["tz"], r["segments"], r["dutyType"]
        ), axis=1)

        # ml residual
        X = data[["dutyType","totalFlightHours","restHours","consecNight","tz","segments"]]
        try:
            if model is not None:
                ml_res = model.predict(X)
                ml_res = np.array(ml_res).flatten()
            else:
                ml_res = np.zeros(len(data))
        except Exception as e:
            print("Model predict error:", e)
            ml_res = np.zeros(len(data))

        data["mlResidual"] = ml_res
        data["finalScore"] = np.clip(data["ruleScore"].values + data["mlResidual"].astype(float), 0.0, 1.0)
        data["riskLevel"] = data["finalScore"].apply(fatigue_level)

        out = []
        for i, r in data.iterrows():
            out.append({
                "pilotId": str(r["pilotId"]),
                "score": float(r["finalScore"]),
                "ruleScore": float(r["ruleScore"]),
                "mlResidual": float(r["mlResidual"]),
                "riskLevel": r["riskLevel"]
            })
        return jsonify({"predictions": out})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------- upload-roster (Excel upload used by Node, but can be called directly for testing) ----------
@app.route("/api/upload-roster", methods=["POST"])
def upload_roster_endpoint():
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"success": False, "message": "No file uploaded"}), 400
        # try read excel
        try:
            df = pd.read_excel(file, sheet_name=0)
        except Exception as e:
            # fallback to CSV reading
            file.seek(0)
            df = pd.read_csv(file)

        data = normalize_and_extract(df)
        # compute predictions locally
        data["ruleScore"] = data.apply(lambda r: rule_score(
            r["totalFlightHours"], r["restHours"], r["consecNight"], r["tz"], r["segments"], r["dutyType"]
        ), axis=1)

        X = data[["dutyType","totalFlightHours","restHours","consecNight","tz","segments"]]
        try:
            if model is not None:
                ml_res = model.predict(X); ml_res = np.array(ml_res).flatten()
            else:
                ml_res = np.zeros(len(data))
        except Exception as e:
            print("Model predict error at upload:", e); ml_res = np.zeros(len(data))

        data["mlResidual"] = ml_res
        data["finalScore"] = np.clip(data["ruleScore"].values + data["mlResidual"].astype(float), 0, 1)
        data["riskLevel"] = data["finalScore"].apply(fatigue_level)

        rows_out = []
        for i, r in data.iterrows():
            rows_out.append({
                "pilotId": str(r["pilotId"]),
                "fullName": str(r.get("fullName","")),
                "date": str(r.get("date","")),
                "totalFlightHours": float(r["totalFlightHours"]),
                "restHours": float(r["restHours"]),
                "consecNight": float(r["consecNight"]),
                "tz": float(r["tz"]),
                "segments": float(r["segments"]),
                "dutyType": r["dutyType"],
                "ruleScore": float(r["ruleScore"]),
                "mlResidual": float(r["mlResidual"]),
                "finalScore": float(r["finalScore"]),
                "riskLevel": r["riskLevel"]
            })
        return jsonify({"success": True, "message": f"Roster processed ({len(rows_out)} rows).", "rows": rows_out})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == "__main__":
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
