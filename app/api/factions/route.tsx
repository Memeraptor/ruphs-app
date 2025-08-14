import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const factions = await prisma.faction.findMany();
  return NextResponse.json(factions);
}
