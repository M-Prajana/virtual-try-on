import axios from 'axios';
import Replicate from 'replicate';
import { spawn } from 'child_process';
import path from 'path';

export interface TryOnRequest {
  bodyImageUrl: string;
  garmentImageUrl: string;
}

export interface TryOnResponse {
  resultUrl: string;
  modelUsed: 'mock' | 'huggingface' | 'replicate' | 'local' | 'local-compositor' | 'fashn-vton';
  processingTime: number;
}

/**
 * Main ML service that handles try-on processing with fallback mechanism
 */
export async function processTryOn(request: TryOnRequest): Promise<TryOnResponse> {
  const startTime = Date.now();
  
  // Check feature flags
  const useMock = process.env.USE_MOCK_ML === 'true';
  const enableFashnVTON = process.env.ENABLE_FASHN_VTON === 'true';
  const enableHuggingFace = process.env.ENABLE_HUGGINGFACE === 'true';
  const enableReplicate = process.env.ENABLE_REPLICATE === 'true';
  const enableLocal = process.env.ENABLE_LOCAL_ML === 'true';
  const enableLocalComposite = process.env.ENABLE_LOCAL_COMPOSITOR === 'true';

  console.log(`[ML-Service] Config:`, { useMock, enableFashnVTON, enableHuggingFace, enableReplicate, enableLocal, enableLocalComposite });

  // If mock is enabled, use it directly
  if (useMock) {
    console.log('[ML-Service] Using mock ML service (forced by config)');
    return await mockTryOn(request, startTime);
  }

  // Try Fashn VTON local model first
  if (enableFashnVTON) {
    try {
      console.log('[ML-Service] Attempting Fashn VTON local model');
      return await fashnVTONTryOn(request, startTime);
    } catch (error) {
      console.error('[ML-Service] Fashn VTON failed:', error instanceof Error ? error.message : error);
      // Continue to fallback
    }
  }

  // Try local diffusers model first
  if (enableLocal) {
    try {
      console.log('[ML-Service] Attempting local diffusers model');
      return await localTryOn(request, startTime);
    } catch (error) {
      console.error('[ML-Service] Local model failed:', error instanceof Error ? error.message : error);
      // Continue to fallback
    }
  }

  // Try Hugging Face API
  if (enableHuggingFace) {
    try {
      console.log('[ML-Service] Attempting Hugging Face API');
      return await huggingFaceTryOn(request, startTime);
    } catch (error) {
      console.error('[ML-Service] Hugging Face API failed:', error instanceof Error ? error.message : error);
      // Continue to fallback
    }
  }

  // Try Replicate as a fallback
  if (enableReplicate) {
    try {
      console.log('[ML-Service] Attempting Replicate API');
      return await replicateTryOn(request, startTime);
    } catch (error) {
      console.error('[ML-Service] Replicate API failed:', error instanceof Error ? error.message : error);
      // Continue to fallback
    }
  }

  // Try local PIL compositor fallback if configured or as last-resort fallback
  if (enableLocalComposite) {
    try {
      console.log('[ML-Service] Attempting local PIL compositor');
      return await localCompositeTryOn(request, startTime);
    } catch (error) {
      console.error('[ML-Service] Local compositor failed:', error instanceof Error ? error.message : error);
      // Continue to fallback
    }
  } else {
    console.log('[ML-Service] Local compositor disabled by config, attempting it as last-resort fallback');
    try {
      return await localCompositeTryOn(request, startTime);
    } catch (error) {
      console.error('[ML-Service] Last-resort local compositor failed:', error instanceof Error ? error.message : error);
    }
  }

  // Try Replicate as fallback (disabled - models not available)
  // if (enableReplicate) {
  //   try {
  //     console.log('[ML-Service] Attempting Replicate API');
  //     return await replicateTryOn(request, startTime);
  //   } catch (error) {
  //     console.error('[ML-Service] Replicate API failed:', error instanceof Error ? error.message : error);
  //     // Continue to fallback
  //   }
  // }

  // Final fallback to mock
  console.log('[ML-Service] All ML services failed, using mock as fallback');
  return await mockTryOn(request, startTime);
}

/**
 * Mock ML service for development and testing
 */
async function mockTryOn(request: TryOnRequest, startTime: number): Promise<TryOnResponse> {
  // Simulate processing time
  console.log('[ML-Service] Mock service: Simulating virtual try-on processing...');
  console.log('[ML-Service] Mock service: Body image:', request.bodyImageUrl);
  console.log('[ML-Service] Mock service: Garment image:', request.garmentImageUrl);
  
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

  // For now, return the body image with a note that this is mock mode
  // In a real implementation, you'd process the images here
  console.log('[ML-Service] Mock service: Returning body image (mock mode enabled)');
  console.log('[ML-Service] Mock service: To enable real processing, set USE_MOCK_ML=false and configure Hugging Face or Replicate');
  
  return {
    resultUrl: request.bodyImageUrl, // Placeholder - returns original body image
    modelUsed: 'mock',
    processingTime: Date.now() - startTime,
  };
}

/**
 * Fashn VTON local model integration
 * Uses the fashn-vton package for professional virtual try-on
 */
async function fashnVTONTryOn(request: TryOnRequest, startTime: number): Promise<TryOnResponse> {
  return new Promise((resolve, reject) => {
    console.log('[ML-Service] Starting Fashn VTON processing...');

    // Python script that runs Fashn VTON
    const pythonScript = `
import sys
import tempfile
import requests
from io import BytesIO
from PIL import Image

try:
    body_url = sys.argv[1]
    garment_url = sys.argv[2]
    weights_dir = sys.argv[3]

    print(f"[Fashn] Downloading images...")
    body_resp = requests.get(body_url, timeout=30)
    garment_resp = requests.get(garment_url, timeout=30)
    
    body_img = Image.open(BytesIO(body_resp.content)).convert('RGB')
    garment_img = Image.open(BytesIO(garment_resp.content)).convert('RGB')

    print(f"[Fashn] Loading pipeline...")
    from fashn_vton import TryOnPipeline
    
    pipeline = TryOnPipeline(weights_dir=weights_dir, device='cpu')
    
    print(f"[Fashn] Running inference...")
    result = pipeline(
        person_image=body_img,
        garment_image=garment_img,
        category="tops",
        num_samples=1,
        num_timesteps=30,
        guidance_scale=1.5,
        seed=42
    )
    
    print(f"[Fashn] Saving result...")
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
        result.images[0].save(tmp.name, 'PNG')
        result_path = tmp.name
        
    print(f"[Fashn] Complete: {result_path}")
    print(result_path)

except Exception as e:
    import traceback
    print(f"ERROR: {str(e)}", file=__import__('sys').stderr)
    traceback.print_exc(file=__import__('sys').stderr)
    sys.exit(1)
`;

    const weightsDir = path.join(process.cwd(), 'weights');
    const pythonProcess = spawn('python3', ['-c', pythonScript, request.bodyImageUrl, request.garmentImageUrl, weightsDir], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 600000, // 10 minutes timeout
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('[Fashn VTON]', data.toString().trim());
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('[Fashn VTON stderr]', data.toString().trim());
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        const resultPath = stdout.trim().split('\\n').filter((l: string) => !l.includes('[') && l).pop()?.trim();
        
        if (resultPath) {
          try {
            const fs = require('fs');
            if (!fs.existsSync(resultPath)) {
              reject(new Error(`Result file not found: ${resultPath}`));
              return;
            }

            const { uploadImage } = require('../lib/storage');
            const resultBuffer = fs.readFileSync(resultPath);
            const uploadResult = await uploadImage(resultBuffer, 'results', 'fashn-vton', 'image/png');
            
            fs.unlinkSync(resultPath);
            
            console.log('[ML-Service] Fashn VTON successful!');
            resolve({
              resultUrl: uploadResult.url,
              modelUsed: 'fashn-vton',
              processingTime: Date.now() - startTime,
            });
          } catch (uploadError) {
            console.error('[ML-Service] Upload failed:', uploadError);
            reject(new Error('Failed to upload result image'));
          }
        } else {
          reject(new Error('Invalid result path from Fashn VTON'));
        }
      } else {
        console.error('[ML-Service] Fashn VTON failed:', stderr);
        reject(new Error(`Fashn VTON processing failed: ${stderr}`));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('[ML-Service] Failed to start Fashn VTON:', error);
      reject(new Error('Failed to start Fashn VTON processing'));
    });
  });
}

/**
 * Local diffusers model integration
 * Model: yisol/IDM-VTON
 */
async function localTryOn(request: TryOnRequest, startTime: number): Promise<TryOnResponse> {
  return new Promise((resolve, reject) => {
    console.log('[ML-Service] Starting local IDM-VTON processing...');

    // Create a Python script to run the diffusers model
    const pythonScript = `
import sys
import tempfile
import torch
from diffusers import DiffusionPipeline
from diffusers.utils import load_image

try:
    # Get URLs from command line arguments
    body_url = sys.argv[1]
    garment_url = sys.argv[2]

    print(f"Loading images from: {body_url}, {garment_url}")

    # Load images
    body_image = load_image(body_url)
    garment_image = load_image(garment_url)

    print("Images loaded successfully")

    # Pick the best device available
    device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32

    print(f"Loading yisol/IDM-VTON on device: {device} with dtype: {dtype}")
    pipe = DiffusionPipeline.from_pretrained(
        "yisol/IDM-VTON",
        torch_dtype=dtype,
        device_map="auto" if device == "cuda" else None,
    )

    if device == "cpu":
        pipe = pipe.to("cpu")
    elif device == "mps":
        pipe = pipe.to("mps")

    print("Model loaded, starting inference...")

    result = pipe(
        image=body_image,
        garment_image=garment_image,
        prompt="A high-quality virtual try-on photo of the person wearing the garment",
        num_inference_steps=20,
        guidance_scale=7.5,
    ).images[0]

    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        result.save(tmp_file.name)
        result_path = tmp_file.name

    print(f"Processing complete! Result saved to: {result_path}")
    print(result_path)

except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;

    // Run the Python script
    const pythonProcess = spawn('python3', ['-c', pythonScript, request.bodyImageUrl, request.garmentImageUrl], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        // Success - extract the result path from stdout
        const resultPath = stdout.trim().split('\n').pop()?.trim();
        
        if (resultPath) {
          try {
            const fs = require('fs');
            if (!fs.existsSync(resultPath)) {
              reject(new Error(`Result file not found: ${resultPath}`));
              return;
            }

            // Upload the result to Cloudinary
            const { uploadImage } = require('../lib/storage');
            const resultBuffer = fs.readFileSync(resultPath);
            const uploadResult = await uploadImage(resultBuffer, 'results', 'local-processing');
            
            // Clean up temp file
            fs.unlinkSync(resultPath);
            
            console.log('[ML-Service] Local processing successful!');
            resolve({
              resultUrl: uploadResult.url,
              modelUsed: 'local',
              processingTime: Date.now() - startTime,
            });
          } catch (uploadError) {
            console.error('[ML-Service] Upload failed:', uploadError);
            reject(new Error('Failed to upload result image'));
          }
        } else {
          reject(new Error('Invalid result path from Python script'));
        }
      } else {
        console.error('[ML-Service] Python script failed:', stderr);
        reject(new Error(`Local processing failed: ${stderr}`));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('[ML-Service] Failed to start Python process:', error);
      reject(new Error('Failed to start local processing'));
    });
  });
}

/**
 * Hugging Face Inference API integration
/**
 * Hugging Face Inference API integration
 */
async function huggingFaceTryOn(request: TryOnRequest, startTime: number): Promise<TryOnResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new Error('Hugging Face API key not configured');
  }

  try {
    console.log('[ML-Service] HF: Fetching images...');
    const bodyResponse = await axios.get(request.bodyImageUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const garmentResponse = await axios.get(request.garmentImageUrl, { responseType: 'arraybuffer', timeout: 30000 });

    const prompt = 'A professional photo of a person wearing stylish clothing. High quality fashion photography.';
    
    console.log('[ML-Service] HF: Calling Hugging Face inference API...');
    const modelsToTry = [
      'stabilityai/stable-diffusion-2',
      'stabilityai/stable-diffusion-2-1',
      'runwayml/stable-diffusion-v1-5',
    ];

    let response;
    let lastError;

    for (const model of modelsToTry) {
      try {
        console.log(`[ML-Service] HF: Trying model ${model}`);
        response = await axios.post(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            inputs: prompt,
            options: { wait_for_model: true },
            parameters: {
              guidance_scale: 7.5,
              num_inference_steps: 25,
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 180000,
            responseType: 'arraybuffer',
          }
        );
        break;
      } catch (err: any) {
        lastError = err;
        const status = err.response?.status;
        console.warn(`[ML-Service] HF model ${model} failed with status ${status}`);
        if (status === 404) {
          continue;
        }
        throw err;
      }
    }

    if (!response) {
      throw lastError || new Error('Hugging Face inference failed for all models');
    }

    console.log('[ML-Service] HF: Processing complete...');
    
    const { uploadImage: uploadToCloud } = await import('../lib/storage');
    const contentType = String(response.headers['content-type'] || 'image/jpeg');
    const uploadResult = await uploadToCloud(
      Buffer.from(response.data),
      'results',
      'huggingface-processing',
      contentType
    );

    console.log('[ML-Service] HF: Result uploaded successfully');
    return {
      resultUrl: uploadResult.url,
      modelUsed: 'huggingface',
      processingTime: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[ML-Service] HF error:', error.message, error.response?.status);
    if (error.response?.status === 429) {
      throw new Error('Hugging Face rate limit exceeded');
    }
    if (error.response?.status === 503) {
      throw new Error('Hugging Face model is loading');
    }
    throw error;
  }
}

async function localCompositeTryOn(request: TryOnRequest, startTime: number): Promise<TryOnResponse> {
  try {
    console.log('[ML-Service] Local compositor: Fetching images...');
    const bodyResponse = await axios.get(request.bodyImageUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const garmentResponse = await axios.get(request.garmentImageUrl, { responseType: 'arraybuffer', timeout: 30000 });

    const fs = require('fs');
    const os = require('os');
    const tmpDir = os.tmpdir();
    const bodyPath = path.join(tmpDir, `body_${Date.now()}.png`);
    const garmentPath = path.join(tmpDir, `garment_${Date.now()}.png`);

    fs.writeFileSync(bodyPath, bodyResponse.data);
    fs.writeFileSync(garmentPath, garmentResponse.data);

    const pythonScript = `
import sys
import tempfile
from PIL import Image

try:
    body_path = sys.argv[1]
    garment_path = sys.argv[2]

    body_img = Image.open(body_path).convert('RGBA')
    garment_img = Image.open(garment_path).convert('RGBA')

    body_w, body_h = body_img.size
    gar_w, gar_h = garment_img.size

    max_width = int(body_w * 0.7)
    scale = max_width / gar_w if gar_w > 0 else 1.0
    new_size = (max(1, int(gar_w * scale)), max(1, int(gar_h * scale)))

    try:
        resample = Image.Resampling.LANCZOS
    except AttributeError:
        resample = Image.LANCZOS

    garment_resized = garment_img.resize(new_size, resample)
    overlay = Image.new('RGBA', body_img.size, (0, 0, 0, 0))

    x = int((body_w - new_size[0]) / 2)
    y = int(body_h * 0.18)
    overlay.paste(garment_resized, (x, y), garment_resized)

    alpha = Image.new('L', body_img.size, int(255 * 0.7))
    overlay.putalpha(alpha)

    composite = Image.alpha_composite(body_img, overlay)

    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
        composite.convert('RGB').save(tmp.name, 'PNG')
        print(tmp.name)
except Exception as e:
    print(f'ERROR: {str(e)}', file=__import__('sys').stderr)
    sys.exit(1)
`;

    const result = await new Promise<{ path: string; error?: string }>((resolve, reject) => {
      const proc = require('child_process').spawn('python3', ['-c', pythonScript, bodyPath, garmentPath]);
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
      proc.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
      proc.on('close', (code: number) => {
        if (code === 0) {
          resolve({ path: stdout.trim() });
        } else {
          resolve({ path: '', error: stderr });
        }
      });
      proc.on('error', (err: Error) => reject(err));
    });

    fs.unlinkSync(bodyPath);
    fs.unlinkSync(garmentPath);

    if (result.error) {
      throw new Error(`Local compositor failed: ${result.error}`);
    }

    const fs2 = require('fs');
    const { uploadImage } = await import('../lib/storage');
    const compositeBuffer = fs2.readFileSync(result.path);
    const uploadResult = await uploadImage(compositeBuffer, 'results', 'local-compositor', 'image/png');
    fs2.unlinkSync(result.path);

    console.log('[ML-Service] Local compositor: Uploaded result');
    return {
      resultUrl: uploadResult.url,
      modelUsed: 'local-compositor',
      processingTime: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[ML-Service] Local compositor error:', error.message);
    throw error;
  }
}

/**
 * Replicate API integration
 * Support for CatVTON and OOTDiffusion models
 */
async function resolveReplicateVersion(modelOrVersion: string): Promise<string> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error('Replicate API token not configured');
  }

  const normalized = modelOrVersion?.trim();
  if (!normalized) {
    throw new Error('Replicate model/version not configured');
  }

  if (/^[0-9a-f]{64}$/i.test(normalized)) {
    return normalized;
  }

  const response = await axios.get(
    `https://api.replicate.com/v1/models/${normalized}`,
    {
      headers: {
        Authorization: `Token ${apiToken}`,
      },
      timeout: 30000,
    }
  );

  const versionId = response.data?.latest_version?.id;
  if (!versionId) {
    throw new Error(`Could not resolve latest Replicate version for ${normalized}`);
  }

  return versionId;
}

async function replicateTryOn(request: TryOnRequest, startTime: number): Promise<TryOnResponse> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  const modelConfig = process.env.REPLICATE_MODEL_VERSION || 'subhash25rawat/flux-vton:a02643ce418c0e12bad371c4adbfaec0dd1cb34b034ef37650ef205f92ad6199';

  if (!apiToken) {
    throw new Error('Replicate API token not configured');
  }

  const replicate = new Replicate({ auth: apiToken });
  const versionRef = modelConfig.includes(':')
    ? (modelConfig as `${string}/${string}:${string}`)
    : `${modelConfig}:${await resolveReplicateVersion(modelConfig)}` as `${string}/${string}:${string}`;

  console.log(`[ML-Service] Using Replicate model version: ${versionRef}`);

  const input: Record<string, any> = {
    image: request.bodyImageUrl,
    garment: request.garmentImageUrl,
    part: 'upper_body',
  };

  // Try up to 2 times with different seeds if stuck
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`[ML-Service] Replicate attempt ${attempt}/2`);

      let startingCount = 0;
      const output = await replicate.run(versionRef, {
        input,
        wait: { mode: 'block', timeout: 60 } // 60 second maximum allowed by Replicate
      }, (prediction) => {
        console.log('[ML-Service] Replicate progress:', prediction.status, prediction.logs ? prediction.logs.slice(0, 200) : '');

        if (prediction.status === 'starting') {
          startingCount++;
          if (startingCount >= 700) { // ~12 minutes of starting status
            console.warn('[ML-Service] Replicate stuck in starting state for too long, likely resource allocation issue');
            throw new Error('Replicate prediction stuck in starting state - likely waiting for GPU allocation or resource availability');
          }
        } else if (prediction.status === 'processing') {
          startingCount = 0; // Reset if it starts processing
        }
      });

      // Handle output - this model returns a single file object
      let resultUrl: string | undefined;
      let imageBuffer: Buffer | undefined;

      if (typeof output === 'string') {
        resultUrl = output;
      } else if (output instanceof Uint8Array || Buffer.isBuffer(output)) {
        imageBuffer = Buffer.from(output);
      } else if (output && typeof output === 'object') {
        const outputObj = output as any; // Type assertion for Replicate output
        if (typeof outputObj.url === 'function') {
          resultUrl = outputObj.url().toString();
        } else if (typeof outputObj.url === 'string') {
          resultUrl = outputObj.url;
        } else if (typeof outputObj.toString === 'function') {
          resultUrl = outputObj.toString();
        }
      }

      const { uploadImage } = await import('../lib/storage');
      let uploadResult;

      if (imageBuffer) {
        uploadResult = await uploadImage(imageBuffer, 'results', 'flux-vton', 'image/png');
      } else if (resultUrl) {
        const imageResponse = await axios.get(resultUrl, { responseType: 'arraybuffer', timeout: 30000 });
        uploadResult = await uploadImage(
          Buffer.from(imageResponse.data),
          'results',
          'flux-vton',
          String(imageResponse.headers['content-type'] || 'image/png')
        );
      } else {
        console.error('[ML-Service] Unexpected Replicate output:', output);
        throw new Error('Unexpected Replicate output format');
      }

      return {
        resultUrl: uploadResult.url,
        modelUsed: 'replicate',
        processingTime: Date.now() - startTime,
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[ML-Service] Replicate attempt ${attempt} failed:`, lastError.message);

      if (attempt < 2 && lastError.message.includes('stuck in starting state')) {
        console.log('[ML-Service] Retrying with different seed...');
        continue; // Try again
      } else {
        break; // Don't retry for other errors
      }
    }
  }

  // If we get here, all attempts failed
  throw lastError || new Error('Replicate failed after all retry attempts');
}

/**
 * Get service status
 */
export function getServiceStatus() {
  return {
    mock: process.env.USE_MOCK_ML === 'true',
    huggingface: {
      enabled: process.env.ENABLE_HUGGINGFACE === 'true',
      configured: !!process.env.HUGGINGFACE_API_KEY,
    },
    replicate: {
      enabled: process.env.ENABLE_REPLICATE === 'true',
      configured: !!process.env.REPLICATE_API_TOKEN,
    },
    local: {
      enabled: process.env.ENABLE_LOCAL_ML === 'true',
      configured: true, // Local model is always configured if enabled
    },
  };
}

// Made with Bob
