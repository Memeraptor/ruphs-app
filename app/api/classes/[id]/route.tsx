import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { classUpdateSchema } from "../schema";

const prisma = new PrismaClient();

// GET /api/classes/[id] - Get a specific class by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classId = parseInt(id);

    // Validate ID parameter
    if (isNaN(classId) || classId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid class ID",
          message: "Class ID must be a positive integer",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeRaces = searchParams.get("includeRaces") === "true";
    const includeSpecializations =
      searchParams.get("includeSpecializations") === "true";

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        races: includeRaces
          ? {
              include: {
                race: true,
              },
            }
          : false,
        specializations: includeSpecializations,
      },
    });

    if (!classData) {
      return NextResponse.json(
        {
          success: false,
          error: "Class not found",
          message: `Class with ID ${classId} does not exist`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("Error fetching class:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch class",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/classes/[id] - Update a specific class by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classId = parseInt(id);

    // Validate ID parameter
    if (isNaN(classId) || classId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid class ID",
          message: "Class ID must be a positive integer",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate the request body using Zod schema
    const validatedData = classUpdateSchema.parse(body);

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return NextResponse.json(
        {
          success: false,
          error: "Class not found",
          message: `Class with ID ${classId} does not exist`,
        },
        { status: 404 }
      );
    }

    // Check for duplicate name or slug (excluding current class)
    if (validatedData.name || validatedData.slug) {
      const duplicateClass = await prisma.class.findFirst({
        where: {
          AND: [
            { id: { not: classId } },
            {
              OR: [
                validatedData.name ? { name: validatedData.name } : {},
                validatedData.slug ? { slug: validatedData.slug } : {},
              ].filter((condition) => Object.keys(condition).length > 0),
            },
          ],
        },
      });

      if (duplicateClass) {
        return NextResponse.json(
          {
            success: false,
            error: "Duplicate entry",
            message:
              duplicateClass.name === validatedData.name
                ? "A class with this name already exists"
                : "A class with this slug already exists",
          },
          { status: 409 }
        );
      }
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: updatedClass,
      message: "Class updated successfully",
    });
  } catch (error) {
    console.error("Error updating class:", error);

    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          message: "Invalid input data",
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate entry",
          message: "Class with this name or slug already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update class",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id] - Delete a specific class by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classId = parseInt(id);

    // Validate ID parameter
    if (isNaN(classId) || classId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid class ID",
          message: "Class ID must be a positive integer",
        },
        { status: 400 }
      );
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        specializations: true,
        races: true,
      },
    });

    if (!existingClass) {
      return NextResponse.json(
        {
          success: false,
          error: "Class not found",
          message: `Class with ID ${classId} does not exist`,
        },
        { status: 404 }
      );
    }

    // Check for related records that would prevent deletion
    if (existingClass.specializations.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete class",
          message: `Cannot delete class because it has ${existingClass.specializations.length} associated specialization(s)`,
        },
        { status: 409 }
      );
    }

    // Delete related RaceClass records first (due to foreign key constraints)
    await prisma.raceClass.deleteMany({
      where: { classId: classId },
    });

    // Delete the class
    await prisma.class.delete({
      where: { id: classId },
    });

    return NextResponse.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting class:", error);

    // Handle foreign key constraint errors
    if (
      error instanceof Error &&
      error.message.includes("foreign key constraint")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete class",
          message: "Cannot delete class because it has associated records",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete class",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
