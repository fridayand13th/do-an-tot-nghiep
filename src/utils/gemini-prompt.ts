export async function readPrompt(prompt: string): Promise<string> {
  return `Hãy tách thời gian, công việc(Các hoạt động hằng ngày, thường bắt đầu bằng động từ) và hành động(thường là: thêm, sửa, xóa, tìm) khỏi câu sau: "${prompt}".
  Nếu không có ngày tháng năm cụ thể thì hãy tạo ngày tháng năm dựa trên thời gian được cung cấp và thời gian hiện tại ${new Date()}. Lưu ý tôi ở Việt Nam và sử dụng múi giờ GMT+7.
  Nếu hành động là "Tạo" hoặc các từ đồng nghĩa thì trả về là "create", 
  nếu hành động là "Sửa" hoặc các từ đồng nghĩa thì trả về là "update", 
  nếu hành động là "Xóa" hoặc các từ đồng nghĩa thì trả về là "delete".
  Nếu hành động là "Tìm lịch/ công viêc" hoặc các từ đồng nghĩa thì trả về là "find".
  Trạng thái sẽ tương ứng với enum sau:
  enum TaskStatus {
  OPEN = "Chưa xử lý",
  IN_PROGRESS = "Đang xử lý",
  DONE = "Đã xử lý",
  CANCEL = "Hủy",
  },  
  Nếu không nói gì về trạng thái thì trả về là "Chưa xử lý" đối với hành động "Tạo/ Thêm"
  Nếu không nói gì về ngày tháng thì mặc định là null,
  Tên của công việc hãy viết thường
  Nếu hành động là "sửa" mà không có tên công việc mới thì hãy cho tên mới là tên cũ
  Hãy trả về theo dạng dưới đây và Chỉ cần đưa ra kết quả, không cần giải thích gì thêm.
  {
    "startDate": "",
    "endDate": "",
    "name": "Đi học",
    "oldName":"Đi chơi" || null,
    "oldStartDate": "" || null,
    "oldEndDate": "" || null,
    "action": "Tạo",
    "status": "Chưa xử lý"
  }

  Nếu không có bất kỳ phần tử phù hợp(ngày tháng, tên công việc, hành động) hãy trả về {"response": 0}
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
