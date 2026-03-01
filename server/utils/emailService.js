const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create Transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // Changed from 465 to the STARTTLS port
    secure: false, // Must be false for port 587 (it upgrades automatically)
    requireTLS: true, // Forces the secure upgrade
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // 2. Define Email Options
  const mailOptions = {
    from: `"Club Manager Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional: If you want to send HTML emails
  };

  // 3. Send Email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
