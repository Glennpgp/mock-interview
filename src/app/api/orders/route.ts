import { NextRequest, NextResponse } from "next/server";
import { stockservice } from "../../services/stock";

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
//POST request to order parts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "Invalid order format" },
        { status: 400 }
      );
    }

    const parts = stockservice.getParts();
    const processedItems: ProcessedOrderItem[] = [];

    // Validate all items first before making any updates
    for (const item of body) {
      const part = parts.find((p) => p.id === item.partId);

      if (!part) {
        return NextResponse.json(
          { error: `Part not found: ${item.partId}` },
          { status: 404 }
        );
      }
      //if the user orders more parts than the stock
      if (item.quantity > part.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient quantity for ${part.description}. Available: ${part.quantity}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }

      processedItems.push({
        partId: item.partId,
        quantity: item.quantity,
        description: part.description,
        price: part.price,
        lineTotal: Number((part.price * item.quantity).toFixed(2)),
      });
    }

    // Process all inventory updates
    for (const item of processedItems) {
      const part = parts.find((p) => p.id === item.partId);
      if (part) {
        const newQuantity = part.quantity - item.quantity;
        stockservice.updatePartQuantity(part.id, newQuantity);
      }
    }

    const order: Order = {
      id: Date.now(),
      items: processedItems,
      totalCost: Number(
        processedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
      ),
    };

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json(
      {
        error: "Failed to process order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
