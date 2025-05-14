export async function readPrompt(prompt: string): Promise<string> {
  return `You are given a user sentence in VietNamese: "${prompt}".

Your task is to extract the following components:
1. **Action**: One of these values — "create", "update", "delete", "find".
2. **Task name**: This is a description of the task (typically a daily activity, for example: "Đi học, ..."). PLEASE REMEMBER: Words like "công việc", "Tìm" or "lịch" are not valid task names.
3. **Start and end time**: If dates are not provided explicitly, infer them from the current time: ${new Date()}, using Vietnam timezone (GMT+7). If the date is provided but no time is given, default to 00:00 for start time and 23:59 for end time. The format should be "yyyy-mm-ddThh:mm:ss.msmsmsZ.".
4. **Status**: Match this enum:
enum TaskStatus {
  OPEN = "Chưa xử lý",
  IN_PROGRESS = "Đang xử lý",
  DONE = "Đã xử lý",
  CANCEL = "Hủy"
}
Rules:
For "create" actions with no status mentioned, default to "Chưa xử lý".

If no dates are found, return null for startDate and endDate.

Use lowercase for the task name.

For "update" actions, if a new task name is not provided, reuse the old name.

Return only a result in the format shown below. Do not explain anything.

Output Format:
{
  "startDate": "yyyy-mm-ddThh:mm",
  "endDate": "yyyy-mm-ddThh:mm",
  "name": "task name",
  "oldName": "previous task name" || null,
  "oldStartDate": "yyyy-mm-ddThh:mm" || null,
  "oldEndDate": "yyyy-mm-ddThh:mm" || null,
  "action": "create" | "update" | "delete" | "find",
  "status": "Chưa xử lý" | "Đang xử lý" | "Đã xử lý" | "Hủy"
}
If nothing relevant (date, name, action) is found, return:
{ "response": 0 }
  `;
}

export function suggestionPrompt(name: string, hobby: string, taskList: any) {
  return `Giả sử bạn là một chương trình lên lịch công việc. Hãy làm theo yêu cầu sau:

taskList = ${JSON.stringify(taskList)}

Dựa vào danh sách trên hãy đề xuất cho tôi lịch ${name} vào lúc phù hợp(không trùng) với thời gian ở danh sách và tôi thích ${hobby}. Hãy trả về dưới dạng sau và không cần giải thích gì thêm

{suggestName:"", startDate:"", endDate:""}`;
}

export function useCasePrompt(prompt: string) {
  return `Tôi có 2 danh sách sau:
  
  QuestionList = [
  "Làm thế nào để cập nhật công việc?",
  "Làm thế nào để xóa công việc?",
  "Làm cách nào để tạo công việc?",
  "Bạn có thể làm gì?",
  ],

  AnswerList = [
    "Để cập nhật công việc, bạn cần cung cấp cho mình tên công việc cũ và tên công việc mới, cũng như thời gian bắt đầu và kết thúc. Và mình sẽ giúp bạn cập nhật công việc đó. Hoặc là bạn có thể chọn công việc ngay trong màn hình chính để cập nhật",
    "Để xóa công việc, bạn cần chọn vào công việc tại màn hình chính và chọn xóa. Lưu ý khi xóa công việc thì không thể khôi phục lại được",
    "Để tạo công việc, bạn cần cung cấp cho mình tên công việc, thời gian bắt đầu và kết thúc. Và mình sẽ giúp bạn tạo công việc đó. Hoặc là bạn có thể chọn vào nút thêm công việc để tạo công việc mới",
    "Mình là Friday, trợ lý ảo giúp bạn lên lịch công việc. Mình có thể giúp bạn tạo, sửa, và tìm kiếm công việc của bạn. Tuy nhiên nhiều lúc mình cũng có thể không hiểu bạn đang nói gì, nên bạn hãy cố gắng nói rõ ràng một chút nhé. Mình sẽ cố gắng giúp bạn hết sức có thể.",
  ]
  
  Nếu câu hỏi của tôi là "${prompt}"  tương tự với QuestionList thì hãy trả lời với câu trả lời tương ứng trong AnswerList. Và trả về dạng sau: 
  {
    "answer": ""
  }
  
  Nếu câu hỏi của tôi không nằm trong QuestionList thì hãy trả về {
    "answer": "LMAO"
  } và không cần giải thích gì thêm.
  Lưu ý: chỉ cần đưa ra answer, không cần code.
  `;
}
