import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { classSchema } from "./schema";

const prisma = new PrismaClient();

// GET /api/classes - Get all classes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRaces = searchParams.get("includeRaces") === "true";
    const includeSpecializations =
      searchParams.get("includeSpecializations") === "true";
    const armorType = searchParams.get("armorType");

    const classes = await prisma.class.findMany({
      where: armorType ? { armorType: armorType } : undefined,
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
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: classes,
      count: classes.length,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch classes",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/classes - Create a new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body using Zod schema
    const validatedData = classSchema.parse(body);

    // Check if class with same name or slug already exists
    const existingClass = await prisma.class.findFirst({
      where: {
        OR: [{ name: validatedData.name }, { slug: validatedData.slug }],
      },
    });

    if (existingClass) {
      return NextResponse.json(
        {
          success: false,
          error: "Class already exists",
          message:
            existingClass.name === validatedData.name
              ? "A class with this name already exists"
              : "A class with this slug already exists",
        },
        { status: 409 }
      );
    }

    // Create the class
    const newClass = await prisma.class.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        armorType: validatedData.armorType,
        colorCode: validatedData.colorCode,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newClass,
        message: "Class created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating class:", error);

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
        error: "Failed to create class",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
