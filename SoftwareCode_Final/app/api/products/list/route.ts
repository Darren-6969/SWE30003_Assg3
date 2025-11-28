import { NextResponse } from "next/server";
import { productRepository } from "@/lib/repositories/productRepository";

export async function GET() {
  const tickets = await productRepository.findTickets();
  const merch = await productRepository.findMerchandise();
  const combined = [...tickets, ...merch];

  return NextResponse.json(
    combined.map((product) => ({
      productId: product.productId.toString(),
      productName: product.productName,
      unitPrice: Number(product.unitPrice),
      type: product.type,
    }))
  );
}
