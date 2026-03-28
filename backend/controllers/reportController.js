// backend/controllers/reportController.js
const PDFDocument = require("pdfkit");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const Prediction = require("../models/predictionModel");
const Register = require("../models/registerModel");
const Report = require("../models/reportModel"); // ADD THIS


const THEME = {
  background: "#bfd9f3",
  header: "#1e293b",
  headerText: "#ffffff",
  accent: "#515a01",
  accentLight: "#e8e9d5",
  section: "#334155",
  text: "#0f172a",
  textLight: "#64748b",
  border: "#e2e8f0",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

/* ================= PIE CHART ================= */
const chartCanvas = new ChartJSNodeCanvas({
  width: 200,
  height: 200,
  backgroundColour: "transparent",
});

async function generatePieChart(score, risk) {
  const riskColor =
    risk === "High"
      ? THEME.danger
      : risk === "Medium"
        ? THEME.warning
        : THEME.success;

  return await chartCanvas.renderToBuffer({
    type: "doughnut",
    data: {
      labels: ["Fatigue Score", "Remaining Capacity"],
      datasets: [
        {
          data: [score, 1 - score],
          backgroundColor: [riskColor, "#e2e8f0"],
          borderWidth: 0,
          borderRadius: 8,
        },
      ],
    },
    options: {
      cutout: "70%",
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      layout: { padding: 5 },
    },
  });
}

/* ================= HELPER FUNCTIONS ================= */
function drawRoundedRect(doc, x, y, width, height, radius, color) {
  doc.roundedRect(x, y, width, height, radius).fill(color);
}

/* ================= MAIN CONTROLLER ================= */
exports.generatePilotReport = async (req, res) => {
  try {
    const { pilotId } = req.params;

    const pilot = await Register.findOne({ pilotId });
    const predictions = await Prediction.find({ pilotId }).sort({ date: 1 });

    if (!pilot || !predictions.length) {
      return res.status(404).json({ message: "Pilot not found" });
    }

    const score = Number(predictions.at(-1).score);
    const risk = score >= 0.8 ? "High" : score >= 0.5 ? "Medium" : "Low";
    const riskColor =
      risk === "High"
        ? THEME.danger
        : risk === "Medium"
          ? THEME.warning
          : THEME.success;

    const pieChart = await generatePieChart(score, risk);

    /* ================= CREATE REPORTS DIRECTORY ================= */
    const reportsDir = path.join(__dirname, "../generated_reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    /* ================= GENERATE FILENAME ================= */
    const timestamp = moment().format("YYYYMMDD_HHmmss");
    const fileName = `Pilot_Assessment_${pilotId}_${timestamp}.pdf`;
    const filePath = path.join(reportsDir, fileName);

    /* ================= PDF DOCUMENT ================= */
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      font: "Helvetica",
    });

    // Pipe to file and response
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    doc.pipe(res);

    const PAGE_WIDTH = doc.page.width;
    const PAGE_HEIGHT = doc.page.height;

    /* ================= BACKGROUND ================= */
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(THEME.background);

    /* ================= HEADER ================= */
    doc.fillColor(THEME.header).rect(0, 0, PAGE_WIDTH, 75).fill();
    doc.fillColor(THEME.accent).rect(0, 70, PAGE_WIDTH, 5).fill();

    const logoPath = path.join(__dirname, "../public/images/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 15, { width: 45 });
    }

    doc
      .fillColor(THEME.headerText)
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("PILOT ASSESSMENT REPORT", 100, 25);

    doc
      .fillColor("#cbd5e1")
      .fontSize(10)
      .font("Helvetica")
      .text(`Generated: ${moment().format("DD MMM YYYY, HH:mm")}`, 100, 52);

    /* ================= PILOT INFO CARD ================= */
    let y = 90;

    doc
      .fillColor(THEME.accent)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("PILOT INFORMATION", 40, y);

    drawRoundedRect(doc, 40, y + 15, PAGE_WIDTH - 80, 90, 10, "#ffffff");
    doc
      .strokeColor(THEME.border)
      .lineWidth(1)
      .roundedRect(40, y + 15, PAGE_WIDTH - 80, 90, 10)
      .stroke();

    doc.fillColor(THEME.text).fontSize(10).font("Helvetica");

    doc.text(`Name:`, 55, y + 35);
    doc.text(`Pilot ID:`, 55, y + 52);
    doc.text(`Nationality:`, 55, y + 69);

    doc
      .font("Helvetica-Bold")
      .text(`${pilot.fullName}`, 130, y + 35)
      .text(`${pilotId}`, 130, y + 52)
      .text(`${pilot.nationality}`, 130, y + 69);

    doc
      .font("Helvetica")
      .fillColor(THEME.textLight)
      .text(`Assessment: ${moment().format("DD MMM YYYY")}`, 380, y + 35);

    /* ================= FATIGUE SCORE CARD ================= */
    y += 120;

    doc
      .fillColor(THEME.accent)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("FATIGUE ASSESSMENT", 40, y);

    drawRoundedRect(doc, 40, y + 15, PAGE_WIDTH - 80, 120, 10, "#ffffff");
    doc
      .strokeColor(THEME.border)
      .lineWidth(1)
      .roundedRect(40, y + 15, PAGE_WIDTH - 80, 120, 10)
      .stroke();

    doc.image(pieChart, 55, y + 25, { width: 90 });

    doc
      .fillColor(THEME.text)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Fatigue Score", 160, y + 30);

    doc
      .fillColor(riskColor)
      .fontSize(32)
      .font("Helvetica-Bold")
      .text(`${Math.round(score * 100)}%`, 160, y + 45);

    doc
      .fillColor(THEME.textLight)
      .fontSize(10)
      .font("Helvetica")
      .text(`Score: ${score.toFixed(2)} / 1.00`, 160, y + 80);

    drawRoundedRect(doc, 380, y + 30, 80, 28, 20, riskColor);
    doc
      .fillColor("#ffffff")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(risk, 385, y + 38, { width: 70, align: "center" });

    /* ================= RECOMMENDATIONS CARD ================= */
    y += 145;

    doc
      .fillColor(THEME.accent)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("RECOMMENDATIONS", 40, y);

    const recommendations =
      risk === "High"
        ? [
            "Immediate rest required – 24+ hours continuous rest",
            "Avoid night operations for next 72 hours",
            "Medical assessment recommended",
          ]
        : risk === "Medium"
          ? [
              "Limit next duty period to maximum 8 hours",
              "Schedule 12+ hours rest before next duty",
              "Consider strategic napping before duty",
            ]
          : [
              "Fit for normal duty operations",
              "Maintain standard rest cycle (10+ hours)",
              "Stay hydrated and maintain light exercise",
            ];

    const recCardHeight = 40 + recommendations.length * 18;

    drawRoundedRect(
      doc,
      40,
      y + 15,
      PAGE_WIDTH - 80,
      recCardHeight,
      10,
      "#ffffff",
    );
    doc
      .strokeColor(THEME.border)
      .lineWidth(1)
      .roundedRect(40, y + 15, PAGE_WIDTH - 80, recCardHeight, 10)
      .stroke();

    recommendations.forEach((item, i) => {
      doc
        .fillColor(THEME.accent)
        .fontSize(11)
        .text("•", 55, y + 30 + i * 18);

      doc
        .fillColor(THEME.text)
        .font("Helvetica")
        .fontSize(10)
        .text(item, 70, y + 30 + i * 18);
    });

    /* ================= CALCULATION METHODOLOGY ================= */
    y += recCardHeight + 25;

    doc
      .fillColor(THEME.accent)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("CALCULATION METHODOLOGY", 40, y);

    const methodCardHeight = 140;

    drawRoundedRect(
      doc,
      40,
      y + 15,
      PAGE_WIDTH - 80,
      methodCardHeight,
      10,
      "#ffffff",
    );
    doc
      .strokeColor(THEME.border)
      .lineWidth(1)
      .roundedRect(40, y + 15, PAGE_WIDTH - 80, methodCardHeight, 10)
      .stroke();

    doc
      .fillColor(THEME.text)
      .fontSize(9)
      .font("Helvetica")
      .text(
        "Hybrid model combining ICAO/IATA rule-based assessment with ML refinement:",
        55,
        y + 30,
      );

    // Compact components table - INCLUDING DUTY TYPE
    const components = [
      ["Flight Hours", "40%"],
      ["Rest Hours", "25%"],
      ["Night Duties", "15%"],
      ["Time Zones", "10%"],
      ["Flight Segments", "5%"],
      ["Duty Type", "+0-12%"],
    ];

    components.forEach((comp, i) => {
      const compY = y + 50 + i * 16;

      doc
        .fillColor(THEME.text)
        .font("Helvetica")
        .fontSize(8.5)
        .text(`• ${comp[0]}`, 55, compY);

      doc
        .fillColor(THEME.accent)
        .font("Helvetica-Bold")
        .text(comp[1], 180, compY);
    });

    // ML note
    doc
      .fillColor(THEME.text)
      .font("Helvetica")
      .fontSize(8.5)
      .text(
        "• ML Adjustment: Regression model refines score based on historical patterns",
        55,
        y + 125,
      );

    /* ================= FOOTER ================= */
    const footerY = PAGE_HEIGHT - 40;

    doc
      .strokeColor(THEME.border)
      .lineWidth(1)
      .moveTo(40, footerY - 5)
      .lineTo(PAGE_WIDTH - 40, footerY - 5)
      .stroke();

    doc
      .fontSize(7)
      .fillColor(THEME.textLight)
      .font("Helvetica")
      .text("Confidential – For operational use only", 40, footerY);

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, PAGE_WIDTH - 55, footerY - 5, { width: 16 });
      doc
        .fontSize(7)
        .fillColor(THEME.textLight)
        .font("Helvetica-Bold")
        .text("Flightara", PAGE_WIDTH - 120, footerY, {
          align: "right",
          width: 60,
        });
    }

    doc
      .fontSize(7)
      .fillColor(THEME.textLight)
      .font("Helvetica")
      .text(
        `Page 1 | ${moment().format("DD MMM YYYY, HH:mm")}`,
        40,
        footerY + 15,
      );

    doc.end();

    // Wait for file to be written
    writeStream.on("finish", async () => {
      try {
        // Save report metadata to database
        const report = new Report({
          pilotId: pilot.pilotId,
          pilotName: pilot.fullName,
          fileName: fileName,
          filePath: filePath,
          score: score,
          riskLevel: risk,
          generatedAt: new Date(),
        });

        await report.save();
        console.log(`Report saved to database: ${fileName}`);
      } catch (dbError) {
        console.error("Error saving report to database:", dbError);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PDF generation failed" });
  }
};
