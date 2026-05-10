import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get try-on result
    const tryOnResult = await prisma.tryOnResult.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
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
    });

    if (!tryOnResult) {
      return NextResponse.json(
        { success: false, error: "Try-on result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: tryOnResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get try-on result error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch try-on result" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify ownership and delete
    const tryOnResult = await prisma.tryOnResult.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!tryOnResult) {
      return NextResponse.json(
        { success: false, error: "Try-on result not found" },
        { status: 404 }
      );
    }

    await prisma.tryOnResult.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Try-on result deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete try-on result error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete try-on result" },
      { status: 500 }
    );
  }
}

// Made with Bob
