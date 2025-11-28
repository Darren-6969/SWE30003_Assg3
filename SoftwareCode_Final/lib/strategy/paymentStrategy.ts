export type PaymentResult = { success: boolean; message: string };

export interface PaymentStrategy {
  execute(amount: number): Promise<PaymentResult>;
}
