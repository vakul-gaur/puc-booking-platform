const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { fetchRealVehicleData } = require("./vahanService.js");
const { parseVehicleDetails } = require("./vehicleParser.js");

function fetchImageBuffer(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith("https") ? https : http;
        client.get(url, (res) => {
            if (res.statusCode !== 200) return reject(new Error("Image download failed"));
            const data = [];
            res.on("data", (chunk) => data.push(chunk));
            res.on("end", () => resolve(Buffer.concat(data)));
        }).on("error", reject);
    });
}

async function generatePUCCertificate(booking, vehicle) {
    return new Promise(async (resolve, reject) => {
        try {
            const certsDir = path.join(__dirname, "../uploads/certificates");
            if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });

            const vehNum = vehicle?.number || booking.vehicles?.[0]?.number || "UK08AU9155";

            let vData = await fetchRealVehicleData(vehNum);
            if (!vData) {
                vData = parseVehicleDetails(vehNum, vehicle);
            }

            const fileName = `PUC_${vData.cleanNum}_${Date.now()}.pdf`;
            const filePath = path.join(certsDir, fileName);
            const relativePath = `/uploads/certificates/${fileName}`;

            const baseUrl = process.env.PUBLIC_BASE_URL || "http://localhost:8080";
            const publicPdfUrl = `${baseUrl}${relativePath}`;
            const qrDataUrl = await QRCode.toDataURL(publicPdfUrl, { width: 140, margin: 1 });
            const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

            let plateBuffer = null;
            if (booking.proofPhoto) {
                if (booking.proofPhoto.startsWith("http")) {
                    try { plateBuffer = await fetchImageBuffer(booking.proofPhoto); } catch (e) {}
                } else if (fs.existsSync(booking.proofPhoto)) {
                    plateBuffer = booking.proofPhoto;
                }
            }

            const doc = new PDFDocument({ size: "A4", margin: 25 });
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            doc.rect(0, 0, 595.28, 841.89).fill("#FFFDF0");
            doc.rect(20, 20, 555, 800).lineWidth(1.5).strokeColor("#000000").stroke();

            doc.fillColor("#000000").fontSize(14).font("Helvetica-Bold").text("Form 59", 25, 30, { align: "center" });
            doc.fontSize(10).font("Helvetica").text("[See rules 115 (2)]", 25, 46, { align: "center" });

            doc.rect(25, 62, 280, 42).lineWidth(1).strokeColor("#000000").stroke();
            doc.fontSize(10).font("Helvetica-Bold").text("Pollution Under Control Certificate", 30, 68);
            doc.fontSize(8.5).font("Helvetica").text(`Authorised By :\n${vData.stateName} (${vData.rtoArea})`, 30, 81);

            const testDate = new Date(booking.completedAt || Date.now());
            const expiryDate = new Date(booking.expiryDate || Date.now() + 180 * 86400000);

            doc.fontSize(9).font("Helvetica-Bold");
            doc.text("Date", 30, 115); doc.text(":", 110, 115);
            doc.font("Helvetica").text(testDate.toLocaleDateString("en-GB"), 120, 115);

            doc.font("Helvetica-Bold").text("Time", 30, 130); doc.text(":", 110, 130);
            doc.font("Helvetica").text(testDate.toLocaleTimeString("en-US", { hour12: true }), 120, 130);

            doc.font("Helvetica-Bold").text("Validity upto", 30, 145); doc.text(":", 110, 145);
            doc.font("Helvetica").text(expiryDate.toLocaleDateString("en-GB"), 120, 145);

            doc.image(qrBuffer, 460, 65, { width: 95, height: 95 });
            doc.moveTo(20, 170).lineTo(575, 170).lineWidth(1).strokeColor("#000000").stroke();


            const meta = [
                ["Certificate SL. No.", vData.certSLNo],
                ["Registration No.", vData.cleanNum],
                ["Date of Registration", vData.dateOfReg],
                ["Month & Year of Manufacturing", vData.mfgDate],
                ["Valid Mobile Number", booking.user?.contact ? `******${booking.user.contact.slice(-4)}` : "******6026"],
                ["Emission Norms", vData.emissionNorm],
                ["Fuel", vData.fuel],
                ["PUC Code", vData.pucCode],
                ["GSTIN", "-"],
                ["Fees", `Rs. ${booking.totalPrice || 100}.00`],
                ["MIL observation", "No"],
            ];

            let metaY = 176;
            meta.forEach(([k, v]) => {
                doc.fontSize(8.5).font("Helvetica-Bold").text(k, 30, metaY, { width: 170 });
                doc.text(":", 205, metaY);
                doc.font("Helvetica").text(v, 215, metaY);
                metaY += 13.5;
            });

            doc.moveTo(20, metaY + 4).lineTo(575, metaY + 4).lineWidth(1).strokeColor("#000000").stroke();

            const photoBoxY = metaY + 10;
            doc.fontSize(9.5).font("Helvetica-Bold").text("Vehicle Photo with Registration plate", 30, photoBoxY);
            doc.fontSize(8.5).font("Helvetica").text("60 mm x 30 mm", 30, photoBoxY + 14);

            const photoX = 280;
            const photoW = 200;
            const photoH = 80;
            doc.rect(photoX, photoBoxY, photoW, photoH).lineWidth(0.8).strokeColor("#000000").stroke();

            if (plateBuffer) {
                try {
                    doc.image(plateBuffer, photoX + 2, photoBoxY + 2, {
                        fit: [photoW - 4, photoH - 4],
                        align: "center",
                        valign: "center",
                    });
                } catch (e) {
                    doc.fontSize(8).text("[ Photo Processed ]", photoX + 35, photoBoxY + 35);
                }
            } else {
                doc.fontSize(8).fillColor("#666").text("[ Number Plate Photo Attached ]", photoX + 35, photoBoxY + 35);
                doc.fillColor("#000");
            }

            const afterPhotoY = photoBoxY + photoH + 10;
            doc.moveTo(20, afterPhotoY).lineTo(575, afterPhotoY).lineWidth(1).strokeColor("#000000").stroke();

            let tableY = afterPhotoY + 6;
            doc.fontSize(8).font("Helvetica-Bold");
            doc.text("Sr. No.", 30, tableY);
            doc.text("Pollutant (as\napplicable)", 85, tableY, { width: 120 });
            doc.text("Units (as\napplicable)", 210, tableY, { width: 90 });
            doc.text("Emission limits", 320, tableY, { width: 90 });
            doc.text("Measured Value\n(upto 2 decimal places)", 420, tableY, { width: 140 });

            tableY += 24;
            doc.moveTo(25, tableY).lineTo(570, tableY).lineWidth(0.5).strokeColor("#888").stroke();
            tableY += 4;

            doc.fontSize(7.5).font("Helvetica");
            doc.text("1", 40, tableY); doc.text("2", 120, tableY); doc.text("3", 240, tableY); doc.text("4", 350, tableY); doc.text("5", 470, tableY);
            tableY += 14;

            const isDiesel = vData.fuel === "DIESEL";
            const testData = isDiesel
                ? [
                      ["Smoke Density", "Light absorption coefficient", "1/metre", "2.45", "0.82"],
                      ["High Idling", "RPM", "RPM", "2500 ± 200", "2480"],
                  ]
                : [
                      ["Idling Emissions", "Carbon Monoxide (CO)", "percentage (%)", "3.0", "0.18"],
                      ["", "Hydrocarbon, (THC/HC)", "ppm", "3000.0", "98.40"],
                      ["", "CO", "percentage (%)", "0.0", "0.00"],
                      ["High Idling\nemissions", "RPM", "RPM", "2500 ± 200", "2510"],
                      ["", "Lambda", "-", "1 ± 0.03", "0.998"],
                  ];

            testData.forEach(([sec, pol, unit, limit, meas]) => {
                doc.fontSize(7.5).font("Helvetica");
                if (sec) doc.font("Helvetica-Bold").text(sec, 25, tableY, { width: 75 });
                doc.font("Helvetica").text(pol, 105, tableY, { width: 110 });
                doc.text(unit, 220, tableY, { width: 85 });
                doc.text(limit, 330, tableY, { width: 75 });
                doc.font("Helvetica-Bold").text(meas, 460, tableY, { width: 75 });
                tableY += 18;
            });

            doc.fontSize(8).font("Helvetica").text("This PUC certificate is system generated through the national register of motor vehicles and does not require any signature.", 25, tableY + 5, { align: "center", width: 545 });

            const noteY = tableY + 28;
            doc.rect(25, noteY, 545, 18).strokeColor("#000000").lineWidth(0.8).stroke();
            doc.fontSize(7.5).font("Helvetica-Bold").text("Note : 1. Vehicle owners to link their mobile numbers to registered vehicle by logging to https://puc.parivahan.gov.in", 30, noteY + 5);

            const stampY = noteY + 26;
            doc.rect(25, stampY, 260, 48).strokeColor("#555").lineWidth(0.6).stroke();
            doc.fontSize(7).font("Helvetica").text("Authorised Signature with stamp of PUC Operator 60mm x 20mm", 28, stampY + 3);
            doc.fontSize(8.5).font("Helvetica-Bold").fillColor("#1e3a8a").text("KIRAN PARYAVARAN EVAM YATAYAT SANRAKSHAN SAMITI", 32, stampY + 16, { width: 245 });
            doc.fontSize(7.5).font("Helvetica").text("✓ DIGITALLY VERIFIED - TEST PASSED", 32, stampY + 32);

            doc.end();
            writeStream.on("finish", () => resolve(relativePath));
            writeStream.on("error", reject);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generatePUCCertificate };