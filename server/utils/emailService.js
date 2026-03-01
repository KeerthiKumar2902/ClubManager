const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create Transporter
  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
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
