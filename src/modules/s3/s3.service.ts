import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { ErrorHelper } from 'src/helpers/error.utils';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  }

  async uploadFile(file): Promise<string> {
    const key = `${uuid()}-${file.originalname}`;
    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await this.s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  async getFile(key: string): Promise<string> {
    try {
      const getObjectParams = {
        Bucket: this.bucketName,
        Key: key,
      };

      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
      return url;
    } catch (error) {
      ErrorHelper.InternalServerErrorException(error?.message);
    }
  }

  async getKeyFromS3Url(s3Url: string): Promise<string> {
    const urlParts = s3Url.split('.amazonaws.com/');
    return urlParts[1];
  }

  async getFileAsBinary(key: string): Promise<Buffer> {
    const getObjectParams = {
      Bucket: this.bucketName,
      Key: key,
    };
    const command = new GetObjectCommand(getObjectParams);
    const response = await this.s3Client.send(command);
    if (!response.Body || !(response.Body instanceof Readable)) {
      throw new Error('No stream found in S3 response');
    }
    const stream = response.Body as Readable;
    const binaryData = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      stream.on('error', (error) => {
        reject(new Error(`Failed to fetch file: ${error.message}`));
      });
    });
    return binaryData;
  }
}
