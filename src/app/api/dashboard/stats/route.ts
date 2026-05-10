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

    // Get statistics
    const [
      totalTryOns,
      completedTryOns,
      failedTryOns,
      favorites,
      bodyImages,
      garmentImages,
      recentActivity,
    ] = await Promise.all([
      prisma.tryOnResult.count({
        where: { userId: session.user.id },
      }),
      prisma.tryOnResult.count({
        where: { userId: session.user.id, status: "completed" },
      }),
      prisma.tryOnResult.count({
        where: { userId: session.user.id, status: "failed" },
      }),
      prisma.tryOnResult.count({
        where: { userId: session.user.id, isFavorite: true },
      }),
      prisma.bodyImage.count({
        where: { userId: session.user.id },
      }),
      prisma.garmentImage.count({
        where: { userId: session.user.id },
      }),
      prisma.tryOnResult.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          totalTryOns,
          completedTryOns,
          failedTryOns,
          favorites,
          bodyImages,
          garmentImages,
          recentActivity: recentActivity.map((activity) => ({
            id: activity.id,
            type: "try-on",
            status: activity.status,
            createdAt: activity.createdAt,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}

// Made with Bob
