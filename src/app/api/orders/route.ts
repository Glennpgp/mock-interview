import { error } from "console";
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

interface LineItem {
  partId: number;
  quantity: number;
  part?: part;
}

interface Order {
  id?: number;
  lineItems: LineItem[];
  lineItemsTotals?: number[];
  totalCost?: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json(
      { Error: "Invalid order, Please enter array of line items" },
      { status: 400 }
    );
  }

  const processedLineItems: LineItem[] = body.map((item) => {
    if (!item.partId || !item.quantity) {
      throw new Error("Each line item must have a partId and quantity");
    }

    const part = parts.find((p) => p.id === item.partsId);

    //console
    console.log("available Parts:", parts);
    console.log("Current Items:", item);

    if (!part) {
      throw new Error(`Part with ID ${item.partId} not found`);
    }
    //If the user requested exceeds available stock
    if (item.quantity > part.quantity) {
      throw new Error(`Insufficient stock for part ${part.description}`);
    }

    return {
      partId: item.itemId,
      quantity: item.quantity,
      part: part,
    };
  });

  //calculating the line items totals and total order cost

  const lineItemsTotals = processedLineItems.map(
    (item) => (item.part?.price || 0) * item.quantity
  );

  const totalCost = lineItemsTotals.reduce((sum, total) => sum + total, 0);

  //update the inventory i.e reduce the available quantity

  processedLineItems.forEach((item) => {
    const partToUpdate = parts.find((p) => p.id === item.partId);
    if (partToUpdate) {
      partToUpdate.quantity = -item.quantity;
    }
  });

  try {
    const order: Order = {
      id: Math.floor(Math.random() * 100000),
      lineItems: processedLineItems,
      lineItemsTotals,
      totalCost,
    };

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("order processing error:", error);
    return NextResponse.json(
      { Error: error instanceof Error ? error.message : "An unexpected error" },
      { status: 500 }
    );
  }
}
