import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { CreateSpecializationSchema } from "../schema"; // Adjust path as needed

const prisma = new PrismaClient();

// GET single specialization by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const awaited = await params;
    const id = parseInt(awaited.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid specialization ID" },
        { status: 400 }
      );
    }

    const specialization = await prisma.specialization.findUnique({
      where: { id },
      include: {
        class: true,
        characters: {
          include: {
            race: true,
          },
        },
      },
    });

    if (!specialization) {
      return NextResponse.json(
        { error: "Specialization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(specialization);
  } catch (error) {
    console.error("Error fetching specialization:", error);
    return NextResponse.json(
      { error: "Failed to fetch specialization" },
      { status: 500 }
    );
  }
}

// PUT - Update specialization by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid specialization ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate the request body
    const validatedData = CreateSpecializationSchema.parse(body);

    // Check if the specialization exists
    const existingSpecialization = await prisma.specialization.findUnique({
      where: { id },
    });

    if (!existingSpecialization) {
      return NextResponse.json(
        { error: "Specialization not found" },
        { status: 404 }
      );
    }

    // If classId is being changed, check if the new class exists
    if (validatedData.classId !== existingSpecialization.classId) {
      const classExists = await prisma.class.findUnique({
        where: { id: validatedData.classId },
      });

      if (!classExists) {
        return NextResponse.json({ error: "Class not found" }, { status: 404 });
      }
    }

    // Update the specialization
    const updatedSpecialization = await prisma.specialization.update({
      where: { id },
      data: validatedData,
      include: {
        class: true,
        characters: {
          include: {
            race: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSpecialization);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          error:
            "A specialization with this name or slug already exists for this class",
        },
        { status: 409 }
      );
    }

    console.error("Error updating specialization:", error);
    return NextResponse.json(
      { error: "Failed to update specialization" },
      { status: 500 }
    );
  }
}

// DELETE specialization by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid specialization ID" },
        { status: 400 }
      );
    }

    // Check if the specialization exists
    const existingSpecialization = await prisma.specialization.findUnique({
      where: { id },
      include: {
        characters: true,
      },
    });

    if (!existingSpecialization) {
      return NextResponse.json(
        { error: "Specialization not found" },
        { status: 404 }
      );
    }

    // Check if there are characters using this specialization
    if (existingSpecialization.characters.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete specialization with existing characters",
          details: `${existingSpecialization.characters.length} character(s) are using this specialization`,
        },
        { status: 409 }
      );
    }

    // Delete the specialization
    await prisma.specialization.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Specialization deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting specialization:", error);
    return NextResponse.json(
      { error: "Failed to delete specialization" },
      { status: 500 }
    );
  }
}

// PATCH - Partial update specialization by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid specialization ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // For PATCH, we create a partial schema that allows optional fields
    const partialData: any = {};

    if (body.name !== undefined) {
      partialData.name = body.name;
    }

    if (body.slug !== undefined) {
      partialData.slug = body.slug;
    }

    if (body.classId !== undefined) {
      partialData.classId = body.classId;

      // Check if the new class exists
      const classExists = await prisma.class.findUnique({
        where: { id: body.classId },
      });

      if (!classExists) {
        return NextResponse.json({ error: "Class not found" }, { status: 404 });
      }
    }

    // Check if the specialization exists
    const existingSpecialization = await prisma.specialization.findUnique({
      where: { id },
    });

    if (!existingSpecialization) {
      return NextResponse.json(
        { error: "Specialization not found" },
        { status: 404 }
      );
    }

    // Update the specialization with partial data
    const updatedSpecialization = await prisma.specialization.update({
      where: { id },
      data: partialData,
      include: {
        class: true,
        characters: {
          include: {
            race: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSpecialization);
  } catch (error) {
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          error:
            "A specialization with this name or slug already exists for this class",
        },
        { status: 409 }
      );
    }

    console.error("Error partially updating specialization:", error);
    return NextResponse.json(
      { error: "Failed to update specialization" },
      { status: 500 }
    );
  }
}
