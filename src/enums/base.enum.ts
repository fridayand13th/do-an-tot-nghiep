export enum StatusEnum {
  Active = 'ACTIVE',
  InActive = 'INACTIVE',
}

export enum ERoles {
  ADMIN = 'admin',
  USER = 'user',
}

export enum RequestHeadersEnum {
  Authorization = 'authorization',
}

export enum EEndPoint {
  UPLOAD_IMG = 'open-api/upload-image',
  IMG_LIST = 'open-api/image-list',
  SEARCH_SIMILARITY_RESULT = 'open-api/requests/:id/matches',
  IMG_SIMILARITY_CHECK = 'open-api/requests/:id/matches/:matchId',
}
export enum EMethod {
  POST = 'post',
  GET = 'get',
  PUT = 'put',
  DELETE = 'delete',
}
