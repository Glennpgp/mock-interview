import { NextResponse, NextRequest } from "next/server";

let parts = [
  { id: 1, description: "Wire", price: 5.99, quantity: 5 },
  { id: 2, description: "Brake Fluid", price: 4.9, quantity: 20 },
  { id: 3, description: "Engine Oil", price: 15.0, quantity: 12 },
];

//Interfaces for type safety
interface part {
  id: number;
  description: string;
  price: number;
  quantity: number;
}

//Get request to request the server to display all parts
//Tested in Postmen
export async function GET(params: NextRequest) {
  return NextResponse.json(parts);
}

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const body = await req.json();

    //validate the request sent from the client
    const { description, price, quantity } = body;

    if (!description || price == null || !quantity == null) {
      return NextResponse.json(
        { error: "Invalid input, all fields are required." },
        { status: 400 }
      );
    }

    //create a new part with a unique ID
    const newPart = {
      id: parts.length + 1,
      description,
      price,
      quantity,
    };

    //post the part to the endpoint
    parts.push(newPart);

    return NextResponse.json(newPart, { status: 201 });
  }

  return NextResponse.json(
    { Error: `Method ${req.method} not allowed.` },
    { status: 405 }
  );
}
