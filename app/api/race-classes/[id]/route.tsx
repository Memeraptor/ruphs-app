import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { raceClassUpdateSchema } from "../schema";

const prisma = new PrismaClient();

// GET /api/race-classes/[id] - Get a specific race-class relationship by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raceClassId = parseInt(params.id);

    // Validate ID parameter
    if (isNaN(raceClassId) || raceClassId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid race-class ID",
          message: "Race-class ID must be a positive integer",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeRace = searchParams.get("includeRace") === "true";
    const includeClass = searchParams.get("includeClass") === "true";

    const raceClass = await prisma.raceClass.findUnique({
      where: { id: raceClassId },
      include: {
        race: includeRace
          ? {
              include: {
                faction: true,
              },
            }
          : false,
        class: includeClass,
      },
    });

    if (!raceClass) {
      return NextResponse.json(
        {
          success: false,
          error: "Race-class relationship not found",
          message: `Race-class relationship with ID ${raceClassId} does not exist`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: raceClass,
    });
  } catch (error) {
    console.error("Error fetching race-class relationship:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch race-class relationship",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/race-classes/[id] - Update a specific race-class relationship by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raceClassId = parseInt(params.id);

    // Validate ID parameter
    if (isNaN(raceClassId) || raceClassId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid race-class ID",
          message: "Race-class ID must be a positive integer",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate the request body using Zod schema
    const validatedData = raceClassUpdateSchema.parse(body);

    // Check if race-class relationship exists
    const existingRaceClass = await prisma.raceClass.findUnique({
      where: { id: raceClassId },
    });

    if (!existingRaceClass) {
      return NextResponse.json(
        {
          success: false,
          error: "Race-class relationship not found",
          message: `Race-class relationship with ID ${raceClassId} does not exist`,
        },
        { status: 404 }
      );
    }

    // Check for duplicate race-class combination (excluding current relationship)
    if (validatedData.raceId || validatedData.classId) {
      const newRaceId = validatedData.raceId || existingRaceClass.raceId;
      const newClassId = validatedData.classId || existingRaceClass.classId;

      const duplicateRaceClass = await prisma.raceClass.findFirst({
        where: {
          AND: [
            { id: { not: raceClassId } },
            { raceId: newRaceId },
            { classId: newClassId },
          ],
        },
      });

      if (duplicateRaceClass) {
        return NextResponse.json(
          {
            success: false,
            error: "Duplicate race-class relationship",
            message: "This race-class combination already exists",
          },
          { status: 409 }
        );
      }
    }

    // Verify that the race exists (if raceId is being updated)
    if (validatedData.raceId) {
      const race = await prisma.race.findUnique({
        where: { id: validatedData.raceId },
      });

      if (!race) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid race",
            message: "The specified race does not exist",
          },
          { status: 400 }
        );
      }
    }

    // Verify that the class exists (if classId is being updated)
    if (validatedData.classId) {
      const classData = await prisma.class.findUnique({
        where: { id: validatedData.classId },
      });

      if (!classData) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid class",
            message: "The specified class does not exist",
          },
          { status: 400 }
        );
      }
    }

    // Update the race-class relationship
    const updatedRaceClass = await prisma.raceClass.update({
      where: { id: raceClassId },
      data: validatedData,
      include: {
        race: {
          include: {
            faction: true,
          },
        },
        class: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRaceClass,
      message: "Race-class relationship updated successfully",
    });
  } catch (error) {
    console.error("Error updating race-class relationship:", error);

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
          message: "Race-class relationship already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update race-class relationship",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/race-classes/[id] - Delete a specific race-class relationship by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raceClassId = parseInt(params.id);

    // Validate ID parameter
    if (isNaN(raceClassId) || raceClassId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid race-class ID",
          message: "Race-class ID must be a positive integer",
        },
        { status: 400 }
      );
    }

    // Check if race-class relationship exists
    const existingRaceClass = await prisma.raceClass.findUnique({
      where: { id: raceClassId },
      include: {
        race: true,
        class: true,
      },
    });

    if (!existingRaceClass) {
      return NextResponse.json(
        {
          success: false,
          error: "Race-class relationship not found",
          message: `Race-class relationship with ID ${raceClassId} does not exist`,
        },
        { status: 404 }
      );
    }

    // Delete the race-class relationship
    await prisma.raceClass.delete({
      where: { id: raceClassId },
    });

    return NextResponse.json({
      success: true,
      message: "Race-class relationship deleted successfully",
      deletedData: {
        id: raceClassId,
        raceName: existingRaceClass.race.name,
        className: existingRaceClass.class.name,
      },
    });
  } catch (error) {
    console.error("Error deleting race-class relationship:", error);

    // Handle foreign key constraint errors
    if (
      error instanceof Error &&
      error.message.includes("foreign key constraint")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete race-class relationship",
          message:
            "Cannot delete race-class relationship because it has associated records",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete race-class relationship",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
