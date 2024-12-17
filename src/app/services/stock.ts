interface Part {
  id: number;
  description: string;
  price: number;
  quantity: number;
}
// data stored in memory
const parts: Part[] = [
  { id: 1, description: "Wire", price: 5.99, quantity: 5 },
  { id: 2, description: "Brake Fluid", price: 4.9, quantity: 20 },
  { id: 3, description: "Engine Oil", price: 15.0, quantity: 12 },
];

// dedicated stock service
export const stockservice = {
  getParts: () => parts,
  updatePartQuantity: (partId: number, newQuantity: number) => {
    const part = parts.find((p) => p.id === partId);
    if (part) {
      part.quantity = newQuantity;
    }
    return part;
  },
};
