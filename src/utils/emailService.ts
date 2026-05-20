import emailjs from '@emailjs/browser';

// To use this feature, the user must set up a free account at https://www.emailjs.com/
// 1. Add an Email Service (e.g., Gmail)
// 2. Create an Email Template with variables like {{to_email}} and {{to_name}}
// 3. Replace the keys below with your actual keys from EmailJS dashboard

const EMAILJS_SERVICE_ID = "service_ofpnaij"; // Your Service ID
const EMAILJS_TEMPLATE_ID = "template_lb7tjyp"; // Your Template ID
const EMAILJS_PUBLIC_KEY = "pw9Rrcm8bABAb-VAi"; // Your Public Key

export const sendWelcomeEmail = async (email: string, name: string) => {
  if (!email || email.trim() === "") return;

  try {
    const templateParams = {
      to_email: email,
      to_name: name || "User",
      message: "Thank you for joining CareerReady AI 2.0! We are excited to help you on your career journey.",
    };

    // If placeholders are still present, log a warning instead of failing the app
    if (EMAILJS_SERVICE_ID.includes("YOUR_SERVICE_ID")) {
      console.warn("EmailJS is not configured. Please set up your keys in src/utils/emailService.ts to send welcome emails.");
      console.log(`[Mock Email] Sent to ${email}: Thank you for joining CareerReady AI!`);
      return;
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    console.log("Welcome email sent successfully!", response.status, response.text);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
};
