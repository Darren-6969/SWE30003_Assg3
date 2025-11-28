import type { PaymentResult, PaymentStrategy } from "./paymentStrategy";

export class WalletPaymentStrategy implements PaymentStrategy {
  constructor(private walletId: string) {}

  async execute(amount: number): Promise<PaymentResult> {
    if (this.walletId.trim().toLowerCase().includes("fail")) {
      return { success: false, message: "Wallet payment rejected (simulated failure)." };
    }
    return {
      success: true,
      message: `Processed wallet payment of $${amount.toFixed(2)} from ${this.walletId}`,
    };
  }
}
