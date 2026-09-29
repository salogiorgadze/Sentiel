const sendMail = async ({ to, subject, html }) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Sentiel", email: process.env.MAIL_FROM },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo ${response.status}: ${errorText}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

module.exports = sendMail;