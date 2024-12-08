import { NextRequest, NextResponse } from "next/server";
import { parts } from "../part_data/route";

interface OrderItem {
  partId: number;
  quantity: number;
}

interface ProcessedOrderItem extends OrderItem {
  description: string;
  price: number;
  lineTotal: number;
}

interface Order {
  id: number;
  items: ProcessedOrderItem[];
  totalCost: number;
}

//Order POST function
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "Invalid order format" },
        { status: 400 }
      );
    }

    const processedItems: ProcessedOrderItem[] = [];

    // Process each order item
    for (const item of body) {
      const part = parts.find((p) => p.id === item.partId);

      if (!part) {
        return NextResponse.json(
          { error: `Part not found: ${item.partId}` },
          { status: 404 }
        );
      }

      if (item.quantity > part.quantity) {
        return NextResponse.json(
          { error: `Insufficient quantity for ${part.description}` },
          { status: 400 }
        );
      }

      processedItems.push({
        partId: item.partId,
        quantity: item.quantity,
        description: part.description,
        price: part.price,
        lineTotal: part.price * item.quantity,
      });

      // Update inventory
      part.quantity -= item.quantity;
    }

    const order: Order = {
      id: Date.now(),
      items: processedItems,
      totalCost: processedItems.reduce((sum, item) => sum + item.lineTotal, 0),
    };

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
}
