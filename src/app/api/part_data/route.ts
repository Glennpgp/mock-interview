import { NextRequest, NextResponse } from "next/server";

interface Part {
  id: number;
  description: string;
  price: number;
  quantity: number;
}

//In-memory storage
const parts: Part[] = [
  { id: 1, description: "Wire", price: 5.99, quantity: 5 },
  { id: 2, description: "Brake Fluid", price: 4.9, quantity: 20 },
  { id: 3, description: "Engine Oil", price: 15.0, quantity: 12 },
];

//GET /api/part_data
export async function GET() {
  try {
    return NextResponse.json(parts);
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Unable to retrive data, internal Server Error",
      }),
      {
        status: 500,
      }
    );
  }
}

//POST /api/part_data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.description || !body.price || body.quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new part
    const newPart: Part = {
      id: Math.max(0, ...parts.map((p) => p.id)) + 1,
      description: body.description,
      price: Number(body.price),
      quantity: Number(body.quantity),
    };

    parts.push(newPart);
    return NextResponse.json(newPart, { status: 201 });
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to create a part, internal server Err" }),
      {
        status: 500,
      }
    );
  }
}
