import type { PaymentMethod } from "../domain/domainTypes";
import { CardPaymentStrategy } from "../strategy/cardPayment";
import { DummyPaymentStrategy } from "../strategy/dummyPayment";
import { WalletPaymentStrategy } from "../strategy/walletPayment";
import type { PaymentStrategy } from "../strategy/paymentStrategy";

export const paymentStrategyFactory = (
  method: PaymentMethod,
  details?: { cardNumber?: string; cvv?: string; walletId?: string }
): PaymentStrategy => {
  switch (method) {
    case "CARD":
      return new CardPaymentStrategy(details?.cardNumber ?? "0000000000000000", details?.cvv ?? "000");
    case "WALLET":
      return new WalletPaymentStrategy(details?.walletId ?? "default-wallet");
    default:
      return new DummyPaymentStrategy();
  }
};
