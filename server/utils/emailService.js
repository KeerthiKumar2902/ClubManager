const sendEmail = async (options) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        // The sender email must be the one you used to sign up for Brevo
        sender: { email: process.env.EMAIL_USER, name: "Club Manager Support" },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.html || `<p>${options.message}</p>`,
        textContent: options.message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      throw new Error("Failed to send email via Brevo");
    }

    console.log("Email sent successfully via Brevo API!");
  } catch (error) {
    console.error("Email Service Crash:", error);
    throw error; // Let the authController handle the 500 error
  }
};

module.exports = sendEmail;
