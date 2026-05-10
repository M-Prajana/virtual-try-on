import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

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
  try {
    const effectiveMimeType = mimeType || 'image/jpeg';

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
      const uploadSource = `data:${effectiveMimeType};base64,${file.toString('base64')}`;
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
      http_code: error?.http_code,
      status_code: error?.status_code,
      details: error?.details || error?.error || null,
      raw: error,
    });
    const originalMessage = error?.message || JSON.stringify(error) || 'unknown error';
    const uploadError = new Error(`Failed to upload image: ${originalMessage}`);
    (uploadError as any).original = error;
    throw uploadError;
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
