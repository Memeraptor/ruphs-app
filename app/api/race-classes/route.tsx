import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { raceClassSchema } from "./schema";

const prisma = new PrismaClient();

// GET /api/race-classes - Get all race-class relationships
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRace = searchParams.get("includeRace") === "true";
    const includeClass = searchParams.get("includeClass") === "true";
    const raceId = searchParams.get("raceId");
    const classId = searchParams.get("classId");
    const raceName = searchParams.get("raceName");
    const className = searchParams.get("className");
    const factionId = searchParams.get("factionId");

    // Build where clause based on query parameters
    const whereClause: any = {};

    if (raceId) {
      whereClause.raceId = parseInt(raceId);
    }

    if (classId) {
      whereClause.classId = parseInt(classId);
    }

    if (raceName) {
      whereClause.race = {
        name: {
          contains: raceName,
          mode: "insensitive",
        },
      };
    }

    if (className) {
      whereClause.class = {
        name: {
          contains: className,
          mode: "insensitive",
        },
      };
    }

    if (factionId) {
      whereClause.race = {
        ...whereClause.race,
        factionId: parseInt(factionId),
      };
    }

    const raceClasses = await prisma.raceClass.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
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
      orderBy: [{ race: { name: "asc" } }, { class: { name: "asc" } }],
    });

    return NextResponse.json(raceClasses);
  } catch (error) {
    console.error("Error fetching race-class relationships:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch race-class relationships",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/race-classes - Create a new race-class relationship
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body using Zod schema
    const validatedData = raceClassSchema.parse(body);

    // Check if race-class relationship already exists
    const existingRaceClass = await prisma.raceClass.findFirst({
      where: {
        raceId: validatedData.raceId,
        classId: validatedData.classId,
      },
    });

    if (existingRaceClass) {
      return NextResponse.json(
        {
          success: false,
          error: "Race-class relationship already exists",
          message: "This race-class combination already exists",
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

    // Verify that the class exists
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

    // Create the race-class relationship
    const newRaceClass = await prisma.raceClass.create({
      data: {
        raceId: validatedData.raceId,
        classId: validatedData.classId,
      },
      include: {
        race: {
          include: {
            faction: true,
          },
        },
        class: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newRaceClass,
        message: "Race-class relationship created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating race-class relationship:", error);

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
        error: "Failed to create race-class relationship",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
