import { cartRepository } from "../repositories/cartRepository";
import { productRepository } from "../repositories/productRepository";

export type CartSummary = {
  userId: string;
  items: {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  total: number;
};

export const cartService = {
  async getCart(userIdInput: string) {
    if (!userIdInput) {
      return { success: false, message: "userId is required." };
    }

    let userId: bigint;
    try {
      userId = BigInt(userIdInput);
    } catch {
      return { success: false, message: "Invalid userId." };
    }

    const items = await cartRepository.findItemsByUser(userId);

    const mapped = items.map((i) => {
      const unitPrice = Number(i.product.unitPrice);
      const lineTotal = unitPrice * i.quantity;
      return {
        productId: i.productId.toString(),
        productName: i.product.productName,
        unitPrice,
        quantity: i.quantity,
        lineTotal,
      };
    });

    const total = mapped.reduce((sum, i) => sum + i.lineTotal, 0);

    return {
      success: true,
      cart: {
        userId: userIdInput,
        items: mapped,
        total,
      } as CartSummary,
    };
  },

  async addItem(userIdInput: string, productIdInput: string, quantity: number) {
    if (!userIdInput || !productIdInput) {
      return { success: false, message: "userId and productId are required." };
    }

    const safeQty = Number.isFinite(quantity) ? Math.max(1, quantity) : 1;

    let userId: bigint;
    let productId: bigint;
    try {
      userId = BigInt(userIdInput);
      productId = BigInt(productIdInput);
    } catch {
      return { success: false, message: "Invalid identifiers supplied." };
    }

    const product = await productRepository.findById(productId);
    if (!product) {
      return { success: false, message: "Product not found." };
    }

    await cartRepository.addOrUpdateItem(userId, productId, safeQty);

    const updated = await this.getCart(userIdInput);
    if (!updated.success || !updated.cart) {
      return { success: false, message: "Failed to load updated cart." };
    }

    return {
      success: true,
      message: `Added ${safeQty} x ${product.productName} to cart.`,
      cart: updated.cart,
    };
  },

  async clearCart(userIdInput: string) {
    if (!userIdInput) {
      return { success: false, message: "userId is required." };
    }

    let userId: bigint;
    try {
      userId = BigInt(userIdInput);
    } catch {
      return { success: false, message: "Invalid userId." };
    }

    await cartRepository.clearCart(userId);
    return { success: true, message: "Cart cleared." };
  },
};
