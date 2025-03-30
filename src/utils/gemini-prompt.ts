export async function readPrompt(prompt: string): Promise<string> {
  return `Hãy tách thời gian, công việc(Các hoạt động hằng ngày, ...) và hành động(thường là: thêm, sửa, xóa, tìm) khỏi câu sau: "${prompt}".
  Nếu không có ngày tháng năm cụ thể thì hãy tạo ngày tháng năm dựa trên thời gian được cung cấp và thời gian hiện tại ${new Date()}. Lưu ý tôi ở Việt Nam và sử dụng múi giờ GMT+7.
  Nếu hành động là "Tạo" hoặc các từ đồng nghĩa thì trả về là "create", 
  nếu hành động là "Sửa" hoặc các từ đồng nghĩa thì trả về là "update", 
  nếu hành động là "Xóa" hoặc các từ đồng nghĩa thì trả về là "delete".
  Nếu hành động là "Tìm" hoặc các từ đồng nghĩa thì trả về là "find".
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
  Hãy trả về theo dạng dưới đây và Chỉ cần đưa ra kết quả, không cần giải thích gì thêm.
  {
    startDate: "",
    endDate: "",
    name: "Đi học",
    oldName:"Đi chơi" || null,
    oldStartDate: "" || null,
    oldEndDate: "" || null,
    action: "Tạo",
    status: "Chưa xử lý"
  }

  Nếu không có bất kỳ phần tử phù hợp(ngày tháng, tên công việc, hành động) hãy trả về {response: 0}
  `;
}

export function suggestionPrompt(name: string, hobby: string, taskList: any) {
  return `Giả sử bạn là một chương trình lên lịch công việc. Hãy làm theo yêu cầu sau:

taskList = ${JSON.stringify(taskList)}

Dựa vào danh sách trên hãy đề xuất cho tôi lịch ${name} vào lúc phù hợp(không trùng) với thời gian ở danh sách và tôi thích ${hobby}. Hãy trả về dưới dạng sau và không cần giải thích gì thêm

{suggestName:"", startDate:"", endDate:""}`;
}
