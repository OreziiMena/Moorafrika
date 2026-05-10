import { v4 as uuidv4 } from 'uuid';
import {
  ALLOWED_TYPES,
  GeneratePresignedUrlPramaters,
  GeneratePresignedUrlResponse,
} from '@/contracts/media';
import { BadRequestError } from '@/lib/errors';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Environment variables
const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESSKEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

class CloudflareR2StorageServer {
  private _r2Client: S3Client;
  private publicUrl: string;
  private readonly MAX_SIZE = 10 * 1024 * 1024;

  constructor() {
    if (!publicUrl) {
      throw Error('Cloudflare public URL environment variable not setup');
    }
    if (
      !cloudflareAccountId ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucketName ||
      !publicUrl
    ) {
      throw Error('Cloudflare environment variable not setup');
    }

    this.publicUrl = publicUrl;

    this._r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${cloudflareAccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  generatePublicUrl = (key: string) => `${this.publicUrl}/${key}`;


  generatePresignedUrl = async ({
    fileType,
    fileSize,
    folder,
  }: GeneratePresignedUrlPramaters): Promise<GeneratePresignedUrlResponse> => {
    if (!ALLOWED_TYPES.includes(fileType))
      throw new BadRequestError('Invalid file type');
    if (fileSize > this.MAX_SIZE) throw new BadRequestError('File too large');

    const ext = fileType.split('/')[1];
    const key = `${folder}/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const presignedUrl = await getSignedUrl(this._r2Client, command, {
      expiresIn: 60, // 60 seconds
    });
    
    const url = this.generatePublicUrl(key);

    return { presignedUrl, key, url };
  };

  deleteFromR2 = async (key: string) => {
    await this._r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
  };
}

const StorageServerInstance = new CloudflareR2StorageServer();

export default StorageServerInstance;
