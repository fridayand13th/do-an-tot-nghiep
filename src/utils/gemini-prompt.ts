export async function createTaskPrompt(prompt: string): Promise<string> {
  return `Hãy tách thời gian và tên công việc khỏi câu sau: "${prompt}". 
  Hãy trả về theo dạng dưới đây và Chỉ cần đưa ra kết quả, không cần giải thích gì thêm.
{

"startDate": "2024-07-07T10:30:00Z",

"endDate": "2024-07-07T11:30:00Z",

"name": "Đi học"

}`;
}
