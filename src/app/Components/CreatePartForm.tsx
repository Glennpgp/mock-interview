"use client";

import React, { useState } from "react";
import { Part } from "@/types";
import { toast } from "sonner";

interface CreatePartFormProps {
  onPartCreated?: (part: Part) => void;
}

export default function CreatePartForm({ onPartCreated }: CreatePartFormProps) {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate inputs
    if (!description.trim()) {
      setError("Description is required");
      toast.error("Description is required");
      return;
    }

    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a positive number");
      toast.error("Price must be a positive number");
      return;
    }

    if (isNaN(quantityNum) || quantityNum < 0) {
      setError("Quantity must be a non-negative number");
      toast.error("Quantity must be a non-negative number");
      return;
    }

    try {
      const response = await fetch("/api/part_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          price: priceNum,
          quantity: quantityNum,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create part");
        toast.error(errorData.error || "Failed to create part");
      }

      const newPart = await response.json();

      // Reset form
      setDescription("");
      setPrice("");
      setQuantity("");

      // Set success message
      setSuccess(`Part "${newPart.description}" created successfully!`);
      toast.success(`Part "${newPart.description}" created successfully!`);

      // Call optional callback if provided
      onPartCreated?.(newPart);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-blue-500 shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h1 className="text-3xl text-blue-950 text-center font-bold tracking-wide mb-4">
        AUXO
      </h1>
      <div className="max-w-xs mx-auto">
        {" "}
        <h2 className="text-xl font-bold mb-4 text-center text-blue-950">
          Create New Part
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter part description"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="price"
            >
              Price
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter part price"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="quantity"
            >
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter quantity"
              required
            />
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {success}
            </div>
          )}

          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none focus:shadow-outline"
            >
              Create Part
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
