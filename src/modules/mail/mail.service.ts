import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import SMTPPool from "nodemailer/lib/smtp-pool";
import { EmailTemplate } from "./mail.constants";
import * as path from "path";
import Handlebars from "handlebars";
import * as fs from "fs/promises";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const mailConfig: SMTPPool.Options = {
      host: this.configService.get<string>("SMTP_HOST"),
      port: parseInt(this.configService.get<string>("SMTP_PORT", "465")),
      secure: this.configService.get<string>("SMTP_SECURE") === "true", // true for port 465, false for other ports
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASSWORD"),
      },
      pool: true,
    };

    this.transporter = nodemailer.createTransport(mailConfig);
  }

  async compileTemplate(templateName: string, data: any): Promise<string> {
    // Define the path to the template
    const templatePath = path.join(
      __dirname,
      "template",
      `${templateName}.hbs`
    );

    // Read the template file
    const templateSource = await fs.readFile(templatePath, "utf8");

    // Compile the Handlebars template
    const template = Handlebars.compile(templateSource);

    // Return the generated HTML
    return template(data);
  }

  async sendMail(email: string, emailTemplate: EmailTemplate, data: any) {
    const sendResetPasswordLinkTemplate = await this.compileTemplate(
      emailTemplate.template,
      data
    );
    return this.transporter.sendMail({
      from: this.configService.get<string>("MAIL_FROM"),
      to: email,
      subject: emailTemplate["subject"],
      html: sendResetPasswordLinkTemplate,
    });
  }
}
