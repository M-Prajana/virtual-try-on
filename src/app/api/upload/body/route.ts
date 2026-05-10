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
    const uploadResult = await uploadImage(buffer, "body_images", session.user.id);

    // Save to database
    const bodyImage = await prisma.bodyImage.create({
      data: {
        userId: session.user.id,
        imageUrl: uploadResult.url,
        cloudinaryId: uploadResult.publicId,
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
          id: bodyImage.id,
          imageUrl: bodyImage.imageUrl,
          cloudinaryId: bodyImage.cloudinaryId,
          metadata: bodyImage.metadata,
          createdAt: bodyImage.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Body image upload error:", error);
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

    // Get all body images for the user
    const bodyImages = await prisma.bodyImage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        imageUrl: true,
        metadata: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: bodyImages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get body images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// Made with Bob
