import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { raceSchema } from "./schema";

const prisma = new PrismaClient();

// GET /api/races - Get all races
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeClasses = searchParams.get("includeClasses") === "true";
    const includeCharacters = searchParams.get("includeCharacters") === "true";
    const factionId = searchParams.get("factionId");

    const races = await prisma.race.findMany({
      where: factionId ? { factionId: parseInt(factionId) } : undefined,
      include: {
        faction: true, // Always include faction data for frontend compatibility
        classes: includeClasses
          ? {
              include: {
                class: true,
              },
            }
          : false,
        characters: includeCharacters,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Return the races array directly for frontend compatibility
    return NextResponse.json(races);
  } catch (error) {
    console.error("Error fetching races:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch races",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/races - Create a new race
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body using Zod schema
    const validatedData = raceSchema.parse(body);

    // Check if race with same name or slug already exists
    const existingRace = await prisma.race.findFirst({
      where: {
        OR: [{ name: validatedData.name }, { slug: validatedData.slug }],
      },
    });

    if (existingRace) {
      return NextResponse.json(
        {
          success: false,
          error: "Race already exists",
          message:
            existingRace.name === validatedData.name
              ? "A race with this name already exists"
              : "A race with this slug already exists",
        },
        { status: 409 }
      );
    }

    // Verify that the faction exists
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

    // Create the race
    const newRace = await prisma.race.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        factionId: validatedData.factionId,
      },
      include: {
        faction: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newRace,
        message: "Race created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating race:", error);

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
        error: "Failed to create race",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
