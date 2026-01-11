import path from "node:path";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function generateOTP(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

export async function sendVerificationEmail(to: string, otp: string) {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src/common/templates/email-verification.html"
    );

    const file = Bun.file(templatePath);

    if (!(await file.exists())) {
      throw new Error("Email template not found");
    }

    let html = await file.text();

    html = html
      .replace(/{{OTP_CODE}}/g, otp)
      .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear().toString());

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "รหัสยืนยันตัวตนทางอีเมล (OTP) - สติสตางค์",
      html,
    });

    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

export async function sendResetEmail(to: string, resetUrl: string) {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src/common/templates/reset-password.html"
    );

    const file = Bun.file(templatePath);
    if (!(await file.exists())) throw new Error("Template not found");

    let html = await file.text();

    html = html
      .replace(/{{RESET_URL}}/g, resetUrl)
      .replace(
        /{{EXPIRES_MINUTES}}/g,
        (process.env.RESET_TOKEN_EXPIRES_MINUTES ?? "15").toString()
      )
      .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear().toString());

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "รีเซ็ตรหัสผ่านของคุณ",
      html,
    });
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw error;
  }
}
