import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteParams {
  params: {
    raceId: string;
    classId: string;
  };
}

// GET /api/race-classes/[raceId]/[classId]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const raceId = parseInt(params.raceId);
    const classId = parseInt(params.classId);

    // Validate that IDs are valid numbers
    if (isNaN(raceId) || isNaN(classId)) {
      return NextResponse.json(
        { error: "Invalid race ID or class ID. Both must be valid numbers." },
        { status: 400 }
      );
    }

    // Find the specific RaceClass record
    const raceClass = await prisma.raceClass.findUnique({
      where: {
        raceId_classId: {
          raceId: raceId,
          classId: classId,
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

    if (!raceClass) {
      return NextResponse.json(
        { error: "Race-Class combination not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(raceClass, { status: 200 });
  } catch (error) {
    console.error("Error fetching race-class:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching race-class." },
      { status: 500 }
    );
  }
}

// DELETE /api/race-classes/[raceId]/[classId]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const raceId = parseInt(params.raceId);
    const classId = parseInt(params.classId);

    // Validate that IDs are valid numbers
    if (isNaN(raceId) || isNaN(classId)) {
      return NextResponse.json(
        { error: "Invalid race ID or class ID. Both must be valid numbers." },
        { status: 400 }
      );
    }

    // Check if the RaceClass exists before attempting to delete
    const existingRaceClass = await prisma.raceClass.findUnique({
      where: {
        raceId_classId: {
          raceId: raceId,
          classId: classId,
        },
      },
    });

    if (!existingRaceClass) {
      return NextResponse.json(
        { error: "Race-Class combination not found." },
        { status: 404 }
      );
    }

    // Delete the RaceClass record
    await prisma.raceClass.delete({
      where: {
        raceId_classId: {
          raceId: raceId,
          classId: classId,
        },
      },
    });

    return NextResponse.json(
      { message: "Race-Class combination deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting race-class:", error);
    return NextResponse.json(
      { error: "Internal server error while deleting race-class." },
      { status: 500 }
    );
  }
}
