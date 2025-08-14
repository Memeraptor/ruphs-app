import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { raceClassSchema } from "./schema";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for bulk creation
const bulkRaceClassSchema = z.object({
  raceId: z.number().int().positive(),
  classIds: z
    .array(z.number().int().positive())
    .min(1, "At least one class must be selected"),
});

// Type for Prisma where clause
interface WhereClause {
  raceId?: number;
  classId?: number;
  race?: {
    name?: {
      contains: string;
      mode: "insensitive";
    };
    factionId?: number;
  };
  class?: {
    name: {
      contains: string;
      mode: "insensitive";
    };
  };
}

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
    const whereClause: WhereClause = {};

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

    // Check if this is a bulk operation
    if (body.classIds && Array.isArray(body.classIds)) {
      return handleBulkCreate(body);
    }

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

// Helper function to handle bulk creation
async function handleBulkCreate(body: unknown) {
  try {
    // Validate the request body using bulk schema
    const validatedData = bulkRaceClassSchema.parse(body);

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

    // Verify that all classes exist
    const classes = await prisma.class.findMany({
      where: {
        id: {
          in: validatedData.classIds,
        },
      },
    });

    if (classes.length !== validatedData.classIds.length) {
      const foundClassIds = classes.map((c) => c.id);
      const missingClassIds = validatedData.classIds.filter(
        (id) => !foundClassIds.includes(id)
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid classes",
          message: `The following class IDs do not exist: ${missingClassIds.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Check for existing relationships
    const existingRaceClasses = await prisma.raceClass.findMany({
      where: {
        raceId: validatedData.raceId,
        classId: {
          in: validatedData.classIds,
        },
      },
    });

    const existingClassIds = existingRaceClasses.map((rc) => rc.classId);
    const newClassIds = validatedData.classIds.filter(
      (id) => !existingClassIds.includes(id)
    );

    if (newClassIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "All relationships already exist",
          message: "All specified race-class relationships already exist",
        },
        { status: 409 }
      );
    }

    // Create new race-class relationships
    const createData = newClassIds.map((classId) => ({
      raceId: validatedData.raceId,
      classId: classId,
    }));

    const newRaceClasses = await prisma.raceClass.createMany({
      data: createData,
      skipDuplicates: true,
    });

    // Fetch the created relationships with includes
    const createdRaceClasses = await prisma.raceClass.findMany({
      where: {
        raceId: validatedData.raceId,
        classId: {
          in: newClassIds,
        },
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

    const result = {
      success: true,
      data: createdRaceClasses,
      message: `Successfully created ${newRaceClasses.count} race-class relationships`,
      stats: {
        created: newRaceClasses.count,
        skipped: existingClassIds.length,
        total: validatedData.classIds.length,
      },
    };

    if (existingClassIds.length > 0) {
      result.message += ` (${existingClassIds.length} relationships were skipped as they already existed)`;
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating bulk race-class relationships:", error);

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

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create bulk race-class relationships",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
