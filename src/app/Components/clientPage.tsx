"use client";
import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  Package,
  Trash2,
} from "lucide-react";

// Interfaces for type safety
interface Part {
  id: number;
  description: string;
  price: number;
  quantity: number;
}

interface LineItem {
  partId: number;
  quantity: number;
  part: Part;
  total: number;
}

export default function PartsManagementSystem() {
  // State management
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedParts, setSelectedParts] = useState<LineItem[]>([]);
  const [newPart, setNewPart] = useState<Partial<Part>>({
    description: "",
    price: 0,
    quantity: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  // Fetch parts on component mount
  useEffect(() => {
    fetchParts();
  }, []);

  // Fetch parts from the API
  const fetchParts = async () => {
    try {
      const response = await fetch("./api/part_data");
      if (!response.ok) throw new Error("Failed to fetch parts");
      const data = await response.json();
      setParts(data);
    } catch (err) {
      setError("Failed to fetch parts");
    }
  };

  // Handle adding a new part
  const handleAddPart = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!newPart.description || newPart.price === 0 || newPart.quantity === 0) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("./api/part_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPart),
      });

      if (!response.ok) {
        throw new Error("Failed to add part");
      }

      const addedPart = await response.json();
      setParts([...parts, addedPart]);

      // Reset form
      setNewPart({ description: "", price: 0, quantity: 0 });
      setSuccess("Part added successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Add part to order
  const addToOrder = (part: Part) => {
    const existingItem = selectedParts.find((item) => item.partId === part.id);

    if (existingItem) {
      // Increment quantity if part already in order
      if (existingItem.quantity < part.quantity) {
        const updatedParts = selectedParts.map((item) =>
          item.partId === part.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: item.total + part.price,
              }
            : item
        );
        setSelectedParts(updatedParts);
      } else {
        setError("Cannot add more than available stock");
      }
    } else {
      // Add new part to order
      const newLineItem: LineItem = {
        partId: part.id,
        quantity: 1,
        part: part,
        total: part.price,
      };
      setSelectedParts([...selectedParts, newLineItem]);
    }
  };

  // Remove part from order
  const removeFromOrder = (partId: number) => {
    setSelectedParts(selectedParts.filter((item) => item.partId !== partId));
  };

  // Place order
  const placeOrder = async () => {
    if (selectedParts.length === 0) {
      setError("Your order is empty");
      return;
    }

    try {
      const response = await fetch("./api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          selectedParts.map((item) => ({
            partId: item.partId,
            quantity: item.quantity,
          }))
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const orderResult = await response.json();
      setSuccess(`Order placed successfully! Order ID: ${orderResult.id}`);
      setSelectedParts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Update part quantity in order
  const updateQuantity = (partId: number, newQuantity: number) => {
    const part = parts.find((p) => p.id === partId);
    if (!part) return;

    if (newQuantity > part.quantity) {
      setError("Cannot order more than available stock");
      return;
    }

    const updatedParts = selectedParts.map((item) =>
      item.partId === partId
        ? { ...item, quantity: newQuantity, total: part.price * newQuantity }
        : item
    );
    setSelectedParts(updatedParts);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Parts Inventory Section */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Package className="mr-2" /> Parts Inventory
          </h2>
          {/* Add New Part Form */}
          <form onSubmit={handleAddPart} className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Description"
                value={newPart.description}
                onChange={(e) =>
                  setNewPart((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newPart.price}
                onChange={(e) =>
                  setNewPart((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                className="border p-2 rounded"
                step="0.01"
                min="0"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newPart.quantity}
                onChange={(e) =>
                  setNewPart((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
                className="border p-2 rounded"
                min="0"
                required
              />
              <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Add Part
              </button>
            </div>
          </form>

          {/* Parts List */}
          <div className="grid md:grid-cols-2 gap-2">
            {parts.map((part) => (
              <div
                key={part.id}
                className="border p-2 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{part.description}</p>
                  <p>
                    ${part.price.toFixed(2)} | Stock: {part.quantity}
                  </p>
                </div>
                <button
                  onClick={() => addToOrder(part)}
                  disabled={part.quantity === 0}
                  className="bg-blue-500 text-white p-1 rounded disabled:bg-gray-300"
                >
                  Order
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Section */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <ShoppingCart className="mr-2" /> Current Order
          </h2>
          {selectedParts.map((item) => (
            <div
              key={item.partId}
              className="flex justify-between items-center border-b p-2"
            >
              <div>
                <p className="font-bold">{item.part.description}</p>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.partId, Number(e.target.value))
                    }
                    min="1"
                    max={item.part.quantity}
                    className="w-16 border rounded mr-2 p-1"
                  />
                  <p>${item.total.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFromOrder(item.partId)}
                className="text-red-500 hover:bg-red-100 p-1 rounded"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {selectedParts.length > 0 && (
            <div className="mt-4">
              <p className="text-xl font-bold">
                Total: $
                {selectedParts
                  .reduce((sum, item) => sum + item.total, 0)
                  .toFixed(2)}
              </p>
              <button
                onClick={placeOrder}
                className="w-full bg-green-500 text-white p-2 rounded mt-2 hover:bg-green-600"
              >
                Place Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Area */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
          <CheckCircle className="mr-2" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
