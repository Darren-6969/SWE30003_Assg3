import { NextResponse } from "next/server";
import { parkRepository } from "@/lib/repositories/parkRepository";

export async function GET() {
  const parks = await parkRepository.findAllParks();
  return NextResponse.json(
    parks.map((park) => ({
      parkId: park.parkId.toString(),
      name: park.name,
      dailyCapacity: park.dailyCapacity,
    }))
  );
}
