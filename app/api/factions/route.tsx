import { prisma } from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const factions = await prisma.faction.findMany();
  return NextResponse.json(factions);
}
