const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create Transporter
  const transporter = nodemailer.createTransport({
    // 1. Hardcode the host and port instead of using the "Gmail" shortcut
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family: 4, // Force IPv4, avoids potential issues with IPv6 in some environments
    // 2. Tell Nodemailer not to panic when passing through Render's proxy
    tls: {
      rejectUnauthorized: false,
    },
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
