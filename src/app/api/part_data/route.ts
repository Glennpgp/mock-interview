import { NextRequest, NextResponse } from "next/server";
import { stockservice } from "../../services/stock";

export async function GET() {
  try {
    const parts = stockservice.getParts();
    return NextResponse.json(parts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch parts" },
      { status: 500 }
    );
  }
}
// POST request to create a Part
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.description || !body.price || body.quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const parts = stockservice.getParts();
    const newPart = {
      id: Math.max(0, ...parts.map((p) => p.id)) + 1,
      description: body.description,
      price: Number(body.price),
      quantity: Number(body.quantity),
    };

    parts.push(newPart);
    return NextResponse.json(newPart, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create a part" },
      { status: 500 }
    );
  }
}
