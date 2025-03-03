export type EmailTemplate = { subject: string; template: string };

export const EmailTemplateNames: Record<string, EmailTemplate> = {
  RESET_PASSWORD: {
    subject: "Yêu cầu đặt lại mật khẩu",
    template: "email-reset-password.template",
  },
};
