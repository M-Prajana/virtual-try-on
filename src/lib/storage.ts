import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'local_uploads');

function ensureLocalUploadDir() {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  file: Buffer | string,
  folder: 'body_images' | 'garment_images' | 'results',
  userId?: string,
  mimeType: string = 'image/jpeg'
): Promise<UploadResult> {
  const effectiveMimeType = mimeType || 'image/jpeg';

  try {
    console.log('[Cloudinary] uploadImage', {
      folder,
      mimeType: effectiveMimeType,
      sourceType: typeof file,
      sourceSize: typeof file === 'string' ? file.length : file.length,
      userId,
    });

    let result;

    if (Buffer.isBuffer(file)) {
      result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `virtual-tryon/${folder}`,
            resource_type: 'image',
            timeout: 120000,
            chunk_size: 6000000,
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
            ],
            ...(userId && { public_id: `${userId}_${Date.now()}` }),
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(uploadResult);
          }
        );

        const bufferStream = Readable.from(file);
        bufferStream.pipe(uploadStream);
      });
    } else {
      const uploadSource = `data:${effectiveMimeType};base64,${file}`;
      result = await cloudinary.uploader.upload(uploadSource, {
        folder: `virtual-tryon/${folder}`,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
        ...(userId && { public_id: `${userId}_${Date.now()}` }),
      });
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      http_code: error?.http_code,
      status_code: error?.status_code,
      details: error?.details || error?.error || null,
      raw: error,
    });

    try {
      ensureLocalUploadDir();
      const extension = effectiveMimeType.split('/')[1]?.split(';')[0] || 'png';
      const fileName = `${folder}_${userId || 'anon'}_${Date.now()}.${extension}`;
      const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);
      let fileBuffer: Buffer;

      if (typeof file === 'string') {
        if (file.startsWith('data:')) {
          const base64Data = file.split(',')[1];
          fileBuffer = Buffer.from(base64Data, 'base64');
        } else {
          fileBuffer = Buffer.from(file, 'utf-8');
        }
      } else {
        fileBuffer = file;
      }

      fs.writeFileSync(filePath, fileBuffer);
      console.log('[Cloudinary] Upload fallback: saved locally', filePath);

      return {
        url: `/local_uploads/${fileName}`,
        publicId: fileName,
        width: 0,
        height: 0,
        format: extension,
        size: fileBuffer.length,
      };
    } catch (localError: any) {
      console.error('Local fallback upload failed:', localError);
      const originalMessage = error?.message || JSON.stringify(error) || 'unknown error';
      const uploadError = new Error(`Failed to upload image: ${originalMessage}`);
      (uploadError as any).original = error;
      throw uploadError;
    }
  }
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Get optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options?.width,
        height: options?.height,
        quality: options?.quality || 'auto',
        fetch_format: 'auto',
        crop: 'limit',
      },
    ],
  });
}

export default cloudinary;

// Made with Bob
