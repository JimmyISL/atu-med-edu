import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.S3_BUCKET || 'suri-tool';
const PREFIX = process.env.S3_PREFIX || 'ATU_CME/';

export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  const fullKey = `${PREFIX}${key}`;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: fullKey,
    Body: body,
    ContentType: contentType,
  }));
  return `https://${BUCKET}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${fullKey}`;
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  const fullKey = key.startsWith(PREFIX) ? key : `${PREFIX}${key}`;
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: fullKey });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function deleteFromS3(key: string): Promise<void> {
  const fullKey = key.startsWith(PREFIX) ? key : `${PREFIX}${key}`;
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: fullKey }));
}

export { s3, BUCKET, PREFIX };
