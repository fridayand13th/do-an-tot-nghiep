export interface IResponse<T> {
  data: T;
}

export interface IStatusChangedFile {
  file_code: string;
  status: string;
  file_name: string;
  total_products: number;
  created_at: Date;
  updated_at: Date;
}

export interface ISimilarityResult {
  status: string;
  message: string;
  result: IProductMatchResponse[];
  errors: any[];
}

export interface IProductMatchResponse {
  product_id: string;
  product_code: string;
  product_name: string;
  product_url: string;
  images: string;
  similarity: number;
  metadata_score: number;
  ocr_score: number;
  total_score: number;
  final_score: number;
}
