import type { PaymentResult, PaymentStrategy } from "./paymentStrategy";

export class DummyPaymentStrategy implements PaymentStrategy {
  async execute(amount: number): Promise<PaymentResult> {
    return {
      success: true,
      message: `Dummy payment accepted for $${amount.toFixed(2)}`,
    };
  }
}
