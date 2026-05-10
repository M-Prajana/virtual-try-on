import axios from 'axios';
import { spawn } from 'child_process';

export interface TryOnRequest {
  bodyImageUrl: string;
  garmentImageUrl: string;
}

export interface TryOnResponse {
  resultUrl: string;
  modelUsed: 'mock' | 'huggingface' | 'replicate' | 'local';
  processingTime: number;
}

/**
 * Main ML service that handles try-on processing with fallback mechanism
 */
export async function processTryOn(request: TryOnRequest): Promise<TryOnResponse> {
  const startTime = Date.now();
  
  // Check feature flags
  const useMock = process.env.USE_MOCK_ML === 'true';
  const enableHuggingFace = process.env.ENABLE_HUGGINGFACE === 'true';
  const enableReplicate = process.env.ENABLE_REPLICATE === 'true';
  const enableLocal = process.env.ENABLE_LOCAL_ML === 'true';

  console.log(`[ML-Service] Config:`, { useMock, enableHuggingFace, enableReplicate, enableLocal });

  // If mock is enabled, use it directly
  if (useMock) {
    console.log('[ML-Service] Using mock ML service (forced by config)');
    return await mockTryOn(request, startTime);
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

  // Try Replicate as fallback
  if (enableReplicate) {
    try {
      console.log('[ML-Service] Attempting Replicate API');
      return await replicateTryOn(request, startTime);
    } catch (error) {
      console.error('[ML-Service] Replicate API failed:', error instanceof Error ? error.message : error);
      // Continue to fallback
    }
  }

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
 * Local diffusers model integration
 * Model: camenduru/IDM-VTON-F16
 */
async function localTryOn(request: TryOnRequest, startTime: number): Promise<TryOnResponse> {
  return new Promise((resolve, reject) => {
    console.log('[ML-Service] Starting local IDM-VTON processing...');

    // Create a Python script to run the diffusers model
    const pythonScript = `
import torch
from diffusers import DiffusionPipeline
from diffusers.utils import load_image
import sys
import os
import tempfile

try:
    # Get URLs from command line arguments
    body_url = sys.argv[1]
    garment_url = sys.argv[2]
    
    print(f"Loading images from: {body_url}, {garment_url}")
    
    # Load images
    body_image = load_image(body_url)
    garment_image = load_image(garment_url)
    
    print("Images loaded successfully")
    
    # Load the model (using CPU for compatibility)
    print("Loading IDM-VTON model...")
    pipe = DiffusionPipeline.from_pretrained(
        "camenduru/IDM-VTON-F16", 
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map="auto" if torch.cuda.is_available() else None
    )
    
    if not torch.cuda.is_available():
        pipe = pipe.to("cpu")
        print("Running on CPU (slower)")
    
    print("Model loaded, starting inference...")
    
    # Run inference
    result = pipe(
        image=body_image,
        prompt="professional photo of a person wearing the garment",
        num_inference_steps=20,  # Faster for demo
        guidance_scale=7.5
    ).images[0]
    
    # Save result to temporary file
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        result.save(tmp_file.name)
        result_path = tmp_file.name
    
    print(f"Processing complete! Result saved to: {result_path}")
    print(result_path)  # Output the path for Node.js to read
    
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
        
        if (resultPath && resultPath.startsWith('/tmp/')) {
          try {
            // Upload the result to Cloudinary
            const fs = require('fs');
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
 * Model: yisol/IDM-VTON
 */
async function huggingFaceTryOn(request: TryOnRequest, startTime: number): Promise<TryOnResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Hugging Face API key not configured');
  }

  try {
    // Note: This is a simplified example. The actual IDM-VTON API might have different requirements.
    // You'll need to adjust based on the actual API documentation.
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/yisol/IDM-VTON',
      {
        inputs: {
          person_image: request.bodyImageUrl,
          garment_image: request.garmentImageUrl,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout
      }
    );

    // The response format depends on the actual API
    // This is a placeholder structure
    return {
      resultUrl: response.data.image || response.data.url,
      modelUsed: 'huggingface',
      processingTime: Date.now() - startTime,
    };
  } catch (error: any) {
    if (error.response?.status === 429) {
      throw new Error('Hugging Face rate limit exceeded');
    }
    throw error;
  }
}

/**
 * Replicate API integration
 * Support for CatVTON and OOTDiffusion models
 */
async function replicateTryOn(request: TryOnRequest, startTime: number): Promise<TryOnResponse> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  const modelVersion = process.env.REPLICATE_MODEL_VERSION || 'catvton'; // catvton or ootdiffusion
  
  if (!apiToken) {
    throw new Error('Replicate API token not configured');
  }

  try {
    // Model versions to use
    const models: Record<string, string> = {
      catvton: 'chenchongsong/catvton:main', // CatVTON model
      ootdiffusion: 'cuuupid/ootdiffusion:latest', // OOTDiffusion model
    };

    const selectedModel = models[modelVersion] || models.catvton;
    console.log(`[ML-Service] Using Replicate model: ${selectedModel}`);

    // Create a prediction
    const createResponse = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: selectedModel,
        input: {
          human_img: request.bodyImageUrl,
          cloth_img: request.garmentImageUrl,
        },
      },
      {
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const predictionId = createResponse.data.id;
    console.log(`[ML-Service] Prediction created: ${predictionId}`);

    // Poll for completion
    let prediction = createResponse.data;
    let pollCount = 0;
    const maxPolls = 120; // 2 minutes max polling

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      pollCount++;
      
      const statusResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${apiToken}`,
          },
          timeout: 30000,
        }
      );
      
      prediction = statusResponse.data;
      console.log(`[ML-Service] Poll ${pollCount}: Status = ${prediction.status}`);
    }

    if (prediction.status === 'failed') {
      console.error(`[ML-Service] Prediction failed:`, prediction.error);
      throw new Error(`Replicate prediction failed: ${prediction.error || 'Unknown error'}`);
    }

    if (pollCount >= maxPolls) {
      throw new Error('Replicate processing timeout');
    }

    // Handle different output formats from different models
    let resultUrl = prediction.output;
    if (Array.isArray(prediction.output)) {
      resultUrl = prediction.output[0]; // CatVTON returns an array
    }

    console.log(`[ML-Service] Result obtained: ${resultUrl}`);

    return {
      resultUrl,
      modelUsed: 'replicate',
      processingTime: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error(`[ML-Service] Replicate error:`, error.message);
    if (error.response?.status === 402) {
      throw new Error('Replicate credits exhausted');
    }
    if (error.response?.status === 401) {
      throw new Error('Replicate API token invalid');
    }
    throw error;
  }
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
