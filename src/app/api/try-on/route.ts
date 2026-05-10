import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { processTryOn } from "@/services/ml-service";
import { uploadImage } from "@/lib/storage";
import { z } from "zod";

const tryOnSchema = z.object({
  bodyImageId: z.string(),
  garmentImageId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate input
    const body = await request.json();
    const validatedData = tryOnSchema.parse(body);

    // Verify body image exists and belongs to user
    const bodyImage = await prisma.bodyImage.findFirst({
      where: {
        id: validatedData.bodyImageId,
        userId: session.user.id,
      },
    });

    if (!bodyImage) {
      return NextResponse.json(
        { success: false, error: "Invalid body image ID" },
        { status: 400 }
      );
    }

    // Verify garment image exists and belongs to user
    const garmentImage = await prisma.garmentImage.findFirst({
      where: {
        id: validatedData.garmentImageId,
        userId: session.user.id,
      },
    });

    if (!garmentImage) {
      return NextResponse.json(
        { success: false, error: "Invalid garment image ID" },
        { status: 400 }
      );
    }

    // Create try-on record with pending status
    const tryOnResult = await prisma.tryOnResult.create({
      data: {
        userId: session.user.id,
        bodyImageId: validatedData.bodyImageId,
        garmentImageId: validatedData.garmentImageId,
        status: "pending",
      },
    });

    // Process try-on asynchronously
    // In production, you'd use a queue system like Bull or BullMQ
    processTryOnAsync(
      tryOnResult.id,
      bodyImage.imageUrl,
      garmentImage.imageUrl
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: tryOnResult.id,
          status: tryOnResult.status,
          bodyImageId: tryOnResult.bodyImageId,
          garmentImageId: tryOnResult.garmentImageId,
          createdAt: tryOnResult.createdAt,
          estimatedTime: 30, // seconds
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Try-on creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create try-on request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: any = { userId: session.user.id };
    if (status) {
      where.status = status;
    }

    // Get try-on results
    const [tryOnResults, total] = await Promise.all([
      prisma.tryOnResult.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          bodyImage: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
          garmentImage: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
        },
      }),
      prisma.tryOnResult.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: tryOnResults,
        pagination: {
          total,
          limit,
          offset,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get try-on results error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch try-on results" },
      { status: 500 }
    );
  }
}

// Async function to process try-on in the background
async function processTryOnAsync(
  tryOnId: string,
  bodyImageUrl: string,
  garmentImageUrl: string
) {
  try {
    // Update status to processing
    await prisma.tryOnResult.update({
      where: { id: tryOnId },
      data: { status: "processing" },
    });

    console.log(`[Try-On] Starting processing for ${tryOnId}`);
    console.log(`[Try-On] Body: ${bodyImageUrl}`);
    console.log(`[Try-On] Garment: ${garmentImageUrl}`);

    // Process the try-on using ML service
    const result = await processTryOn({
      bodyImageUrl,
      garmentImageUrl,
    });

    console.log(`[Try-On] Processing completed with model: ${result.modelUsed}`);
    console.log(`[Try-On] Result URL: ${result.resultUrl}`);

    // Upload result image to storage if it's not already a URL
    let resultUrl = result.resultUrl;
    if (result.modelUsed === 'mock') {
      console.warn(`[Try-On] WARNING: Using mock result for ${tryOnId}`);
      // For mock, we just use the body image URL
      resultUrl = bodyImageUrl;
    }

    // Update try-on result with completed status
    await prisma.tryOnResult.update({
      where: { id: tryOnId },
      data: {
        status: "completed",
        resultUrl,
        modelUsed: result.modelUsed,
        processingMetadata: {
          processingTime: result.processingTime,
          completedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`[Try-On] Successfully saved result for ${tryOnId}`);
  } catch (error) {
    console.error("[Try-On] Processing error:", error);
    
    // Update status to failed
    await prisma.tryOnResult.update({
      where: { id: tryOnId },
      data: {
        status: "failed",
        processingMetadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          failedAt: new Date().toISOString(),
        },
      },
    });
  }
}

// Made with Bob
