import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { characterCreateSchema } from "./schema";

const prisma = new PrismaClient();

// GET /api/characters - Get all characters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRace = searchParams.get("includeRace") === "true";
    const includeSpecialization =
      searchParams.get("includeSpecialization") === "true";
    const raceId = searchParams.get("raceId");
    const specializationId = searchParams.get("specializationId");

    const characters = await prisma.character.findMany({
      where: {
        ...(raceId && { raceId: parseInt(raceId) }),
        ...(specializationId && {
          specializationId: parseInt(specializationId),
        }),
      },
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
      orderBy: {
        name: "asc",
      },
    });

    // Return the characters array directly for frontend compatibility
    return NextResponse.json(characters);
  } catch (error) {
    console.error("Error fetching characters:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch characters",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/characters - Create a new character
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body using Zod schema
    const validatedData = characterCreateSchema.parse(body);

    // Check if character with same name already exists
    const existingCharacter = await prisma.character.findUnique({
      where: { name: validatedData.name },
    });

    if (existingCharacter) {
      return NextResponse.json(
        {
          success: false,
          error: "Character already exists",
          message: "A character with this name already exists",
        },
        { status: 409 },
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
        { status: 400 },
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
        { status: 400 },
      );
    }

    // Create the character
    const newCharacter = await prisma.character.create({
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

    return NextResponse.json(
      {
        success: true,
        data: newCharacter,
        message: "Character created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating character:", error);

    // Handle Zod validation errors
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

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate entry",
          message: "Character with this name already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create character",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
