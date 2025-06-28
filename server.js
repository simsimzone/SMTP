const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json({ limit: "10mb" })); // Support large attachments
app.use(cors());

// POST endpoint for sending emails
app.post("/send-email", async (req, res) => {
  // API key verification
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  // Extract request fields
  const { to, subject, text, html, attachments } = req.body;

  // Configure SMTP transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    // Prepare attachments if any
    const preparedAttachments = (attachments || []).map(att => ({
      filename: att.filename,
      content: att.content,
      encoding: att.encoding || "base64"
    }));

    // Send the email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
      attachments: preparedAttachments
    });

    res.status(200).json({ message: "Email sent successfully with attachments." });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ error: error.toString() });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
