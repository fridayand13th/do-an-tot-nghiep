export type EmailTemplate = { subject: string; template: string };

export const EmailTemplateNames: Record<string, EmailTemplate> = {
  RESET_PASSWORD: {
    subject: "Yêu cầu đặt lại mật khẩu",
    template: "email-reset-password.template",
  },
  REMINDER: {
    subject: "Nhắc nhở hoàn thành công việc",
    template: "reminder-email.template",
  },
  REMINDER_INCOMING_TASK: {
    subject: "Nhắc nhở công việc sắp tới",
    template: "incoming-task-reminder.template",
  },
  REMINDER_INCOMING_TASK_UNDER_ONE_HOUR: {
    subject: "Nhắc nhở công việc sắp tới trong vòng 1 tiếng",
    template: "reminder-incoming-task-under-1h.template",
  },
};
