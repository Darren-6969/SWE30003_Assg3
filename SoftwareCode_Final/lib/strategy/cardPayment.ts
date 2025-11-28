import type { PaymentResult, PaymentStrategy } from "./paymentStrategy";

export class CardPaymentStrategy implements PaymentStrategy {
  constructor(private cardNumber: string, private cvv: string) {}

  async execute(amount: number): Promise<PaymentResult> {
    if (this.cardNumber.trim().endsWith("0000")) {
      return { success: false, message: "Card declined (simulated failure)." };
    }
    const last4 = this.cardNumber.slice(-4);
    // Demo: always succeed.
    return {
      success: true,
      message: `Processed card payment of $${amount.toFixed(2)} ending with ${last4}`,
    };
  }
}
