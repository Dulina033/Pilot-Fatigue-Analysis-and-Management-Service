import os
import glob
import json
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

DATA_DIR = "./data"
MODEL_OUT = "model.pkl"
MODEL_META = "model_meta.json"


# ============================================================
#   PARSE TIME
# ============================================================
def parse_time(val):
    try:
        val = int(val)
        if val < 60:
            return 0, val
        return val // 100, val % 100
    except:
        return 0, 0


# ============================================================
#   RULE NORMALIZER
# ============================================================
def normalize_duty(x):
    s = str(x).lower()
    if "night" in s:
        return "Night"
    if "extend" in s:
        return "Extended"
    if "stand" in s:
        return "Standby"
    return "Normal"


# ============================================================
#   CLEAN FLOAT EXTRACTOR (THIS FIXES YOUR ERROR)
# ============================================================
def to_float(x):
    try:
        return float(x)
    except:
        return 0.0


# ============================================================
#   RULE SCORE — FINAL FIXED VERSION
# ============================================================
def rule_score(total_h, rest_h, consec, tz, seg, duty):
    duty_map = {"Normal": 0, "Extended": 0.08, "Night": 0.12, "Standby": 0.04}

    total_h = to_float(total_h)
    rest_h = to_float(rest_h)
    consec = to_float(consec)
    tz = to_float(tz)
    seg = to_float(seg)

    score = (
        (total_h / 12) * 0.40 +
        (1 - (rest_h / 72)) * 0.25 +
        (consec / 5) * 0.15 +
        (tz / 6) * 0.10 +
        (seg / 6) * 0.05 +
        duty_map.get(normalize_duty(duty), 0)
    )
    return float(np.clip(score, 0, 1))


# ============================================================
#   SAFE GETTER
# ============================================================
def safe_num(df, names):
    for col in names:
        if col in df.columns:
            return pd.to_numeric(df[col], errors="coerce").fillna(0)
    return pd.Series([0] * len(df))


# ============================================================
#   DATA PROCESSORS
# ============================================================
def process_sleep_eff(df):
    out = pd.DataFrame()
    out["restHours"] = safe_num(df, ["Sleep duration"])
    out["sleepEfficiency"] = safe_num(df, ["Sleep efficiency"])
    return out


def process_sleep_health(df):
    out = pd.DataFrame()
    out["stress"] = safe_num(df, ["Stress Level"])
    return out


def process_flights(df):
    out = pd.DataFrame()

    out["totalFlightHours"] = safe_num(df, ["AIR_TIME"]) / 60
    out["segments"] = 1
    out["tz"] = 0

    duty_list = []
    consec_list = []
    prev = False
    streak = 0

    for t in df["SCHEDULED_DEPARTURE"]:
        h, m = parse_time(t)
        is_night = (h >= 20 or h < 6)

        if is_night:
            duty_list.append("Night")
            streak = streak + 1 if prev else 1
            prev = True
        else:
            duty_list.append("Normal")
            streak = 0
            prev = False

        consec_list.append(streak)

    out["dutyType"] = duty_list
    out["consecNight"] = consec_list
    return out


# ============================================================
#   MERGE DATASETS — FIXED VERSION
# ============================================================
def merge_datasets(dfs):
    sleep_eff = None
    sleep_health = None
    flights = None

    for df in dfs:
        c = df.columns
        if "Sleep efficiency" in c:
            sleep_eff = process_sleep_eff(df)
        elif "Quality of Sleep" in c:
            sleep_health = process_sleep_health(df)
        elif "AIR_TIME" in c:
            flights = process_flights(df)

    if sleep_eff is None or sleep_health is None or flights is None:
        raise ValueError("Missing required datasets.")

    sleep_eff = sleep_eff.sample(5000, replace=True).reset_index(drop=True)
    sleep_health = sleep_health.sample(5000, replace=True).reset_index(drop=True)
    flights = flights.sample(5000, replace=True).reset_index(drop=True)

    merged = pd.concat([flights, sleep_eff, sleep_health], axis=1)

    # *** CRITICAL FIX: remove duplicate column names ***
    merged = merged.loc[:, ~merged.columns.duplicated()]

    return merged


# ============================================================
#   LABEL GENERATOR
# ============================================================
def generate_labels(df):
    noise = np.random.normal(0, 0.05, len(df))
    return np.clip(0.4 * df["rule_score"] + noise, 0, 1)


# ============================================================
#   MAIN TRAINING
# ============================================================
def main():
    files = sorted(glob.glob(DATA_DIR + "/*.csv"))
    dfs = [pd.read_csv(f, encoding="latin1", low_memory=False) for f in files]

    merged = merge_datasets(dfs)
    print("Merged shape:", merged.shape)

    # compute rule score (fully safe)
    merged["rule_score"] = merged.apply(
        lambda r: rule_score(
            r["totalFlightHours"],
            r["restHours"],
            r["consecNight"],
            r["tz"],
            r["segments"],
            r["dutyType"]
        ),
        axis=1
    )

    merged["label"] = generate_labels(merged)

    X = merged[["dutyType", "totalFlightHours", "restHours",
                "consecNight", "tz", "segments"]]
    y = merged["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    pre = ColumnTransformer(
        [("duty", OneHotEncoder(handle_unknown="ignore"), ["dutyType"])],
        remainder="passthrough"
    )

    model = Pipeline([
        ("pre", pre),
        ("lr", LinearRegression())
    ])

    model.fit(X_train, y_train)
    pred = model.predict(X_test)

    mae = float(np.mean(np.abs(pred - y_test)))
    mse = float(np.mean((pred - y_test) ** 2))
    r2 = float(model.score(X_test, y_test))

    print("MAE:", mae)
    print("MSE:", mse)
    print("R2:", r2)

    joblib.dump(model, MODEL_OUT)
    with open(MODEL_META, "w") as f:
        json.dump({"mae": mae, "mse": mse, "r2": r2}, f, indent=4)

    print("Training completed.")


if __name__ == "__main__":
    main()
