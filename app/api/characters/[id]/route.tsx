import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { characterUpdateSchema } from "../schema";

const prisma = new PrismaClient();

// GET /api/characters/[id] - Get a single character by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const characterId = parseInt(id);

    if (isNaN(characterId)) {
      return NextResponse.json(
        { success: false, error: "Invalid character ID" },
        { status: 400 },
      );
    }

    const character = await prisma.character.findUnique({
      where: { id: characterId },
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

    if (!character) {
      return NextResponse.json(
        { success: false, error: "Character not found" },
        { status: 404 },
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
      { status: 500 },
    );
  }
}

// PATCH /api/characters/[id] - Update a character
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const characterId = parseInt(id);

    if (isNaN(characterId)) {
      return NextResponse.json(
        { success: false, error: "Invalid character ID" },
        { status: 400 },
      );
    }

    const existing = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Character not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validatedData = characterUpdateSchema.parse(body);

    // If updating raceId, verify the race exists
    if (validatedData.raceId !== undefined) {
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
          { status: 400 },
        );
      }
    }

    // If updating specializationId, verify the specialization exists
    if (validatedData.specializationId !== undefined) {
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
          { status: 400 },
        );
      }
    }

    // If updating name, check uniqueness (excluding current character)
    if (validatedData.name !== undefined) {
      const nameConflict = await prisma.character.findFirst({
        where: {
          name: validatedData.name,
          id: { not: characterId },
        },
      });
      if (nameConflict) {
        return NextResponse.json(
          {
            success: false,
            error: "Duplicate name",
            message: "A character with this name already exists",
          },
          { status: 409 },
        );
      }
    }

    const updatedCharacter = await prisma.character.update({
      where: { id: characterId },
      data: validatedData,
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

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          message: "Invalid input data",
          details: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update character",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/characters/[id] - Delete a character
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const characterId = parseInt(id);

    if (isNaN(characterId)) {
      return NextResponse.json(
        { success: false, error: "Invalid character ID" },
        { status: 400 },
      );
    }

    const existing = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Character not found" },
        { status: 404 },
      );
    }

    await prisma.character.delete({
      where: { id: characterId },
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
      { status: 500 },
    );
  }
}
