import { NextRequest, NextResponse } from "next/server";

interface Part {
  id: number;
  description: string;
  price: number;
  quantity: number;
}

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "Invalid order format" },
        { status: 400 }
      );
    }

    // Fetch parts data from the parts API endpoint
    const partsResponse = await fetch(
      `${request.nextUrl.origin}/api/part_data`
    );
    if (!partsResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch parts data" },
        { status: 500 }
      );
    }
    const parts: Part[] = await partsResponse.json();

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

      // Update inventory via POST request
      const updateResponse = await fetch(
        `${request.nextUrl.origin}/api/part_data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...part,
            quantity: part.quantity - item.quantity,
          }),
        }
      );

      if (!updateResponse.ok) {
        return NextResponse.json(
          { error: "Failed to update inventory" },
          { status: 500 }
        );
      }
    }

    const order: Order = {
      id: Date.now(),
      items: processedItems,
      totalCost: processedItems.reduce((sum, item) => sum + item.lineTotal, 0),
    };

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
}
