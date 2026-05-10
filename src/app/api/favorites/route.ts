import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    // Get all favorite try-on results
    const favorites = await prisma.tryOnResult.findMany({
      where: {
        userId: session.user.id,
        isFavorite: true,
      },
      orderBy: { createdAt: "desc" },
      include: {
        bodyImage: {
          select: {
            imageUrl: true,
          },
        },
        garmentImage: {
          select: {
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: favorites,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// Made with Bob
