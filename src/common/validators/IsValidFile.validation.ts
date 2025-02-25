import { BadRequestException } from '@nestjs/common';
import { MAX_SIZE } from 'src/constants/base.constant';
import path from 'path';
import { ErrorHelper } from 'src/helpers/error.utils';
import * as UPLOAD from 'src/common/messages/upload.message';
export async function validateFile(file: Express.Multer.File): Promise<void> {
  if (!file) {
    ErrorHelper.BadRequestException(UPLOAD.FILE_NOT_PROVIED);
  }

  const extension = path.extname(file.originalname).toLowerCase();
  const validExtension = ['.xlsx'];

  if (!validExtension.includes(extension)) {
    ErrorHelper.BadRequestException(UPLOAD.INVALID_FILE_TYPE);
  }

  if (file.size > MAX_SIZE) {
    // 20MB size limit
    ErrorHelper.BadRequestException(UPLOAD.FILE_OVER_SIZE);
  }
}
