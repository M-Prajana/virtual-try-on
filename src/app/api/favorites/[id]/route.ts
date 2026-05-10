import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
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

    // Verify ownership and update
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

    // Add to favorites
    const updated = await prisma.tryOnResult.update({
      where: { id },
      data: { isFavorite: true },
      select: {
        id: true,
        isFavorite: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Add to favorites error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to favorites" },
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

    // Verify ownership and update
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

    // Remove from favorites
    const updated = await prisma.tryOnResult.update({
      where: { id },
      data: { isFavorite: false },
      select: {
        id: true,
        isFavorite: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove from favorites error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from favorites" },
      { status: 500 }
    );
  }
}

// Made with Bob
