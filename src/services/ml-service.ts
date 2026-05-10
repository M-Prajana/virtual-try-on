import axios from 'axios';

export interface TryOnRequest {
  bodyImageUrl: string;
  garmentImageUrl: string;
}

export interface TryOnResponse {
  resultUrl: string;
  modelUsed: 'mock' | 'huggingface' | 'replicate';
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

  // If mock is enabled, use it directly
  if (useMock) {
    console.log('Using mock ML service');
    return await mockTryOn(request, startTime);
  }

  // Try Hugging Face first
  if (enableHuggingFace) {
    try {
      console.log('Attempting Hugging Face API');
      return await huggingFaceTryOn(request, startTime);
    } catch (error) {
      console.error('Hugging Face API failed:', error);
      // Continue to fallback
    }
  }

  // Try Replicate as fallback
  if (enableReplicate) {
    try {
      console.log('Attempting Replicate API');
      return await replicateTryOn(request, startTime);
    } catch (error) {
      console.error('Replicate API failed:', error);
      // Continue to fallback
    }
  }

  // Final fallback to mock
  console.log('All ML services failed, using mock');
  return await mockTryOn(request, startTime);
}

/**
 * Mock ML service for development and testing
 */
async function mockTryOn(request: TryOnRequest, startTime: number): Promise<TryOnResponse> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

  // Return the body image as result (placeholder)
  // In a real scenario, you'd return a properly processed image
  return {
    resultUrl: request.bodyImageUrl, // Placeholder - returns original body image
    modelUsed: 'mock',
    processingTime: Date.now() - startTime,
  };
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
      }
    );

    const predictionId = createResponse.data.id;

    // Poll for completion
    let prediction = createResponse.data;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${apiToken}`,
          },
        }
      );
      
      prediction = statusResponse.data;
    }

    if (prediction.status === 'failed') {
      throw new Error('Replicate prediction failed');
    }

    // Handle different output formats from different models
    let resultUrl = prediction.output;
    if (Array.isArray(prediction.output)) {
      resultUrl = prediction.output[0]; // CatVTON returns an array
    }

    return {
      resultUrl,
      modelUsed: 'replicate',
      processingTime: Date.now() - startTime,
    };
  } catch (error: any) {
    if (error.response?.status === 402) {
      throw new Error('Replicate credits exhausted');
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
  };
}

// Made with Bob
