import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, otp: string) {
  const templatePath = path.join(process.cwd(), '/src/common/view/email-form.html');

  await fs.access(templatePath);
  let html = await fs.readFile(templatePath, 'utf-8');

  html = html
    .replace(/{{OTP_CODE}}/g, otp)
    .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear().toString());

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'รหัสยืนยันตัวตนทางอีเมล (OTP) - สติสตางค์',
    html,
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}
