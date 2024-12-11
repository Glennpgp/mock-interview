"use client";

import { useState, useEffect } from "react";
import NewPartForm from "./CreatePartForm";
import { toast } from "sonner";

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

interface CartItem extends OrderItem {
  description: string;
  price: number;
}

export default function Home() {
  const [parts, setParts] = useState<Part[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchParts();
  }, []);

  const refreshParts = () => {
    fetchParts();
  };

  const fetchParts = async () => {
    try {
      const response = await fetch("/api/part_data");
      if (!response.ok) {
        setError("Failed to fetch parts");
        toast.error("Failed to fetch parts");
        return;
      }
      const data = await response.json();
      setParts(data);
      setError(null);
    } catch (error) {
      setError("Failed to load parts");
      toast.error("Failed to load parts");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (part: Part) => {
    const existing = cart.find((item) => item.partId === part.id);

    if (existing) {
      if (existing.quantity >= part.quantity) {
        toast.error("Cannot exceed available quantity");
        return;
      }
      setCart(
        cart.map((item) =>
          item.partId === part.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          partId: part.id,
          quantity: 1,
          description: part.description,
          price: part.price,
        },
      ]);
      toast.success(`Added ${part.description} to cart`);
    }
  };

  const removeFromCart = (partId: number) => {
    const item = cart.find((item) => item.partId === partId);
    setCart(cart.filter((item) => item.partId !== partId));
    toast.success(`Removed ${item?.description} from cart`);
  };

  const updateQuantity = (partId: number, newQuantity: number) => {
    const part = parts.find((p) => p.id === partId);
    if (!part) return;

    if (newQuantity > part.quantity) {
      toast.error("Cannot exceed available quantity");
      return;
    }

    if (newQuantity < 1) {
      removeFromCart(partId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.partId === partId ? { ...item, quantity: newQuantity } : item
      )
    );
    toast.success(`Updated quantity for ${part.description}`);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      setError("Cart is empty");
      toast.error("Cart is empty");
      return;
    }

    try {
      const orderItems = cart.map(({ partId, quantity }) => ({
        partId,
        quantity,
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderItems),
      });

      if (!response.ok) {
        setError("Failed to place order");
        toast.error("Failed to place order");
        return;
      }

      const order = await response.json();
      setOrderStatus(
        `Order placed successfully! Total: $${order.totalCost.toFixed(2)}`
      );
      toast.success(
        `Order placed successfully! Total: $${order.totalCost.toFixed(2)}`
      );
      setCart([]);
      setError(null);
      fetchParts();
    } catch (error) {
      setError("Failed to place order");
      toast.error("Failed to place order");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {orderStatus && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {orderStatus}
        </div>
      )}

      <NewPartForm onPartCreated={refreshParts} />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Parts List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Parts</h2>
          <div className="grid gap-4">
            {parts.map((part) => (
              <div
                key={part.id}
                className="border rounded-lg p-4 shadow-sm bg-gray-800"
              >
                <h3 className="font-semibold">{part.description}</h3>
                <div className="mt-2">
                  <p>Price: ${part.price.toFixed(2)}</p>
                  <p>Available: {part.quantity}</p>
                </div>
                <button
                  onClick={() => addToCart(part)}
                  disabled={part.quantity === 0}
                  className={`mt-2 px-4 py-2 rounded ${
                    part.quantity === 0
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping Cart */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.partId}
                  className="border rounded-lg p-4 shadow-sm bg-gray-800"
                >
                  <h3 className="font-semibold">{item.description}</h3>
                  <div className="mt-2">
                    <p>Price: ${item.price.toFixed(2)}</p>
                    <div className="flex items-center mt-2">
                      <label className="mr-2">Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.partId, parseInt(e.target.value))
                        }
                        className="border rounded px-2 py-1 w-20 text-gray-900"
                      />
                    </div>
                    <p className="mt-2">
                      Total: ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.partId)}
                    className="mt-2 px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="border-t pt-4">
                <p className="text-xl font-bold">
                  Total: $
                  {cart
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toFixed(2)}
                </p>
                <button
                  onClick={placeOrder}
                  className="mt-4 w-full px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
