import nodemailer from "nodemailer";

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,       // correo Gmail
        pass: process.env.SMTP_PASSWORD,   // app password
      },
    });
  }

  async sendEmail({ to, subject, html }: { to: string; subject: string; html: string; }) {
    await this.transporter.sendMail({
      from: `"Tu tienda" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  }
}
