import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { raceUpdateSchema } from "../schema";

const prisma = new PrismaClient();

// GET /api/races/[id] - Get a specific race by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raceId = parseInt(id);

    // Validate ID parameter
    if (isNaN(raceId) || raceId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid race ID",
          message: "Race ID must be a positive integer",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeFaction = searchParams.get("includeFaction") === "true";
    const includeClasses = searchParams.get("includeClasses") === "true";
    const includeCharacters = searchParams.get("includeCharacters") === "true";

    const race = await prisma.race.findUnique({
      where: { id: raceId },
      include: {
        faction: includeFaction,
        classes: includeClasses
          ? {
              include: {
                class: true,
              },
            }
          : false,
        characters: includeCharacters,
      },
    });

    if (!race) {
      return NextResponse.json(
        {
          success: false,
          error: "Race not found",
          message: `Race with ID ${raceId} does not exist`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: race,
    });
  } catch (error) {
    console.error("Error fetching race:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch race",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/races/[id] - Update a specific race by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raceId = parseInt(id);

    // Validate ID parameter
    if (isNaN(raceId) || raceId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid race ID",
          message: "Race ID must be a positive integer",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate the request body using Zod schema
    const validatedData = raceUpdateSchema.parse(body);

    // Check if race exists
    const existingRace = await prisma.race.findUnique({
      where: { id: raceId },
    });

    if (!existingRace) {
      return NextResponse.json(
        {
          success: false,
          error: "Race not found",
          message: `Race with ID ${raceId} does not exist`,
        },
        { status: 404 }
      );
    }

    // Check for duplicate name or slug (excluding current race)
    if (validatedData.name || validatedData.slug) {
      const duplicateRace = await prisma.race.findFirst({
        where: {
          AND: [
            { id: { not: raceId } },
            {
              OR: [
                validatedData.name ? { name: validatedData.name } : {},
                validatedData.slug ? { slug: validatedData.slug } : {},
              ].filter((condition) => Object.keys(condition).length > 0),
            },
          ],
        },
      });

      if (duplicateRace) {
        return NextResponse.json(
          {
            success: false,
            error: "Duplicate entry",
            message:
              duplicateRace.name === validatedData.name
                ? "A race with this name already exists"
                : "A race with this slug already exists",
          },
          { status: 409 }
        );
      }
    }

    // Verify that the faction exists (if factionId is being updated)
    if (validatedData.factionId) {
      const faction = await prisma.faction.findUnique({
        where: { id: validatedData.factionId },
      });

      if (!faction) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid faction",
            message: "The specified faction does not exist",
          },
          { status: 400 }
        );
      }
    }

    // Update the race
    const updatedRace = await prisma.race.update({
      where: { id: raceId },
      data: validatedData,
      include: {
        faction: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRace,
      message: "Race updated successfully",
    });
  } catch (error) {
    console.error("Error updating race:", error);

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
          message: "Race with this name or slug already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update race",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/races/[id] - Delete a specific race by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raceId = parseInt(id);

    // Validate ID parameter
    if (isNaN(raceId) || raceId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid race ID",
          message: "Race ID must be a positive integer",
        },
        { status: 400 }
      );
    }

    // Check if race exists
    const existingRace = await prisma.race.findUnique({
      where: { id: raceId },
      include: {
        characters: true,
        classes: true,
      },
    });

    if (!existingRace) {
      return NextResponse.json(
        {
          success: false,
          error: "Race not found",
          message: `Race with ID ${raceId} does not exist`,
        },
        { status: 404 }
      );
    }

    // Check for related records that would prevent deletion
    if (existingRace.characters.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete race",
          message: `Cannot delete race because it has ${existingRace.characters.length} associated character(s)`,
        },
        { status: 409 }
      );
    }

    // Delete related RaceClass records first (due to foreign key constraints)
    await prisma.raceClass.deleteMany({
      where: { raceId: raceId },
    });

    // Delete the race
    await prisma.race.delete({
      where: { id: raceId },
    });

    return NextResponse.json({
      success: true,
      message: "Race deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting race:", error);

    // Handle foreign key constraint errors
    if (
      error instanceof Error &&
      error.message.includes("foreign key constraint")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete race",
          message: "Cannot delete race because it has associated records",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete race",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
