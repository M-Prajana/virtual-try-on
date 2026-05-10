import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadImage } from "@/lib/storage";
import { validateImageFile } from "@/lib/utils";

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

    // Get form data
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const category = formData.get("category") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadImage(buffer, "garment_images", session.user.id);

    // Save to database
    const garmentImage = await prisma.garmentImage.create({
      data: {
        userId: session.user.id,
        imageUrl: uploadResult.url,
        cloudinaryId: uploadResult.publicId,
        category: category || null,
        metadata: {
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          size: uploadResult.size,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: garmentImage.id,
          imageUrl: garmentImage.imageUrl,
          cloudinaryId: garmentImage.cloudinaryId,
          category: garmentImage.category,
          metadata: garmentImage.metadata,
          createdAt: garmentImage.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Garment image upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
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
    const category = searchParams.get("category");

    // Build where clause
    const where: any = { userId: session.user.id };
    if (category) {
      where.category = category;
    }

    // Get all garment images for the user
    const garmentImages = await prisma.garmentImage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        imageUrl: true,
        category: true,
        metadata: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: garmentImages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get garment images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// Made with Bob
