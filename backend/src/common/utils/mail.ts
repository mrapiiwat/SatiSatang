import nodemailer from 'nodemailer';
import fs, { access } from 'fs/promises';
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

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${process.env.APP_BASE_URL}/api/verify-email?token=${token}`;

  try {
    const templatePath = path.join(process.cwd(), '/src/common/view/email-form.html');

    await access(templatePath);
    console.log(`📧 Loading email template from: ${templatePath}`);

    let html = await fs.readFile(templatePath, 'utf-8');

    html = html
      .replace(/{{VERIFICATION_URL}}/g, url)
      .replace(/{{CURRENT_YEAR}}/g, new Date().getFullYear().toString());

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'การยืนยันตัวตนทางอีเมล - สติสตางค์',
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
}
