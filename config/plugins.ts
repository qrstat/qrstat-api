module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp.gmail.com"),
        port: env("SMTP_PORT", 587),
        auth: {
          user: env("SMTP_USER", "your-email@gmail.com"),
          pass: env("SMTP_PASS", "your-email-password"),
        },
        secure: false, // false = использовать TLS
      },
      settings: {
        defaultFrom: "your-email@gmail.com",
        defaultReplyTo: "your-email@gmail.com",
      },
    },
  },
  i18n: false,
});
