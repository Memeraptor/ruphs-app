import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { characterCreateSchema } from "../schema";

const prisma = new PrismaClient();

// GET /api/characters/[id] - Get a specific character
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID",
          message: "Character ID must be a valid number",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeRace = searchParams.get("includeRace") === "true";
    const includeSpecialization =
      searchParams.get("includeSpecialization") === "true";

    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        race: includeRace
          ? {
              include: {
                faction: true,
              },
            }
          : false,
        specialization: includeSpecialization
          ? {
              include: {
                class: true,
              },
            }
          : false,
      },
    });

    if (!character) {
      return NextResponse.json(
        {
          success: false,
          error: "Character not found",
          message: "No character found with the specified ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(character);
  } catch (error) {
    console.error("Error fetching character:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch character",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/characters/[id] - Update a character
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID",
          message: "Character ID must be a valid number",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate the request body using Zod schema
    const validatedData = characterCreateSchema.parse(body);

    // Check if character exists
    const existingCharacter = await prisma.character.findUnique({
      where: { id },
    });

    if (!existingCharacter) {
      return NextResponse.json(
        {
          success: false,
          error: "Character not found",
          message: "No character found with the specified ID",
        },
        { status: 404 }
      );
    }

    // Check if another character with the same name exists (excluding current character)
    const duplicateCharacter = await prisma.character.findFirst({
      where: {
        name: validatedData.name,
        id: { not: id },
      },
    });

    if (duplicateCharacter) {
      return NextResponse.json(
        {
          success: false,
          error: "Character already exists",
          message: "A character with this name already exists",
        },
        { status: 409 }
      );
    }

    // Verify that the race exists
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

    // Verify that the specialization exists
    const specialization = await prisma.specialization.findUnique({
      where: { id: validatedData.specializationId },
    });

    if (!specialization) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid specialization",
          message: "The specified specialization does not exist",
        },
        { status: 400 }
      );
    }

    // Update the character
    const updatedCharacter = await prisma.character.update({
      where: { id },
      data: {
        name: validatedData.name,
        level: validatedData.level || 1,
        gender: validatedData.gender,
        note: validatedData.note || "",
        raceId: validatedData.raceId,
        specializationId: validatedData.specializationId,
      },
      include: {
        race: {
          include: {
            faction: true,
          },
        },
        specialization: {
          include: {
            class: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCharacter,
      message: "Character updated successfully",
    });
  } catch (error) {
    console.error("Error updating character:", error);

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
          message: "Character with this name already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update character",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/characters/[id] - Delete a character
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID",
          message: "Character ID must be a valid number",
        },
        { status: 400 }
      );
    }

    // Check if character exists
    const existingCharacter = await prisma.character.findUnique({
      where: { id },
    });

    if (!existingCharacter) {
      return NextResponse.json(
        {
          success: false,
          error: "Character not found",
          message: "No character found with the specified ID",
        },
        { status: 404 }
      );
    }

    // Delete the character
    await prisma.character.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Character deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting character:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete character",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
