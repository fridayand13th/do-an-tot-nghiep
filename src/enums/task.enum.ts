export enum TaskStatus {
  OPEN = "Chưa xử lý",
  IN_PROGRESS = "Đang xử lý",
  DONE = "Đã xử lý",
  CANCEL = "Hủy",
}

export enum SearchTaskStatus {
  ALL = "Tất cả",
  OPEN = "Chưa xử lý",
  IN_PROGRESS = "Đang xử lý",
  DONE = "Đã xử lý",
  CANCEL = "Hủy",
}

export enum TaskAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  FIND = "find",
}
