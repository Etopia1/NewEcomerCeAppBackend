// const nodemailer = require("nodemailer");
// require("dotenv").config();

// //const asyncHandler = require("express-async-handler");
// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     service: process.env.SERVICE,
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.MAIL_ID,
//       pass: process.env.MAIL_PASSWORD,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });

//   // async..await is not allowed in global scope, must use a wrapper
//   async function main() {
//     // send mail with defined transport object
//     const info = await transporter.sendMail({
//       from:"",
//       to: options.email,
//       subject: options.subject,
//       html: options.html,
//     });

//     console.log("Message sent: %s", info.messageId);
//     // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
//   }
//   main().catch(console.error);
// };


// module.exports = { sendEmail };

const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Your App <onboarding@resend.dev>", // You can use your custom domain if verified
      to: options.email, // recipient email
      subject: options.subject,
      html: options.html, // HTML body
    });

    if (error) {
      console.error("Email sending failed:", error);
      return;
    }

    console.log("Email sent successfully:", data);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};

module.exports = { sendEmail };
