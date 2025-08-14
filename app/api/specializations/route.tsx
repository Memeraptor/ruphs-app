import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  CreateSpecializationSchema,
  BulkCreateSpecializationSchema,
} from "./schema"; // Adjust path as needed

const prisma = new PrismaClient();

// GET method - returns array of Specialization objects
export async function GET() {
  try {
    const specializations = await prisma.specialization.findMany({
      include: {
        class: true, // Include class information
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(specializations);
  } catch (error) {
    console.error("Error fetching specializations:", error);
    return NextResponse.json(
      { error: "Failed to fetch specializations" },
      { status: 500 }
    );
  }
}

// POST method - creates a new specialization using the schema
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = CreateSpecializationSchema.parse(body);

    // Check if the class exists
    const classExists = await prisma.class.findUnique({
      where: { id: validatedData.classId },
    });

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Create the specialization
    const specialization = await prisma.specialization.create({
      data: validatedData,
      include: {
        class: true,
      },
    });

    return NextResponse.json(specialization, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }

    console.error("Error creating specialization:", error);
    return NextResponse.json(
      { error: "Failed to create specialization" },
      { status: 500 }
    );
  }
}

// Function to create multiple specializations for a single class
export async function createMultipleSpecializations(data: unknown) {
  try {
    // Validate the request data
    const validatedData = BulkCreateSpecializationSchema.parse(data);

    // Check if the class exists
    const classExists = await prisma.class.findUnique({
      where: { id: validatedData.classId },
    });

    if (!classExists) {
      throw new Error("Class not found");
    }

    // Create all specializations for this class
    const createdSpecializations = [];

    for (const specData of validatedData.specializations) {
      try {
        const specialization = await prisma.specialization.create({
          data: {
            name: specData.name,
            slug: specData.slug,
            classId: validatedData.classId,
          },
          include: {
            class: true,
          },
        });

        createdSpecializations.push(specialization);
      } catch (error) {
        // Skip if there's a unique constraint violation
        console.warn(
          `Skipped creating specialization ${specData.name} due to conflict ${error}`
        );
      }
    }

    return createdSpecializations;
  } catch (error) {
    console.error("Error creating multiple specializations:", error);
    throw error;
  }
}

// Additional endpoint for bulk creation (multiple specializations for one class)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const specializations = await createMultipleSpecializations(body);

    return NextResponse.json(
      {
        message: `Successfully created ${specializations.length} specializations`,
        specializations,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }

    console.error("Error in bulk creation:", error);
    return NextResponse.json(
      { error: "Failed to create specializations" },
      { status: 500 }
    );
  }
}
