import { AwsSesProvider } from 'src/modules/aws-ses/aws-ses.provider';
import { SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';

@Injectable()
export class AwsSesService {
  constructor(private readonly configService: ConfigService, private readonly sesClient: AwsSesProvider) {}

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const sourceEmail = this.configService.get<string>('SES_EMAIL_ADDRESS');
    const params: SendEmailCommandInput = {
      Source: sourceEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: body,
          },
        },
      },
    };

    try {
      await this.sesClient.client.send(new SendEmailCommand(params));
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to send email to ${to}`);
    }
  }

  async createTemplate(data, fileName: string): Promise<string> {
    const { email, link } = data;
    const templatePath = path.resolve(__dirname, `../aws-ses/template/${fileName}`);
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    return template({ email, link });
  }
}
