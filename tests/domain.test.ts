import { describe, expect, it } from "vitest";
import { calculateCartTotal, calculateItemCount } from "@/lib/domain/domainHelpers";

describe("domain helpers", () => {
  it("calculates ticket count", () => {
    const count = calculateItemCount([
      { quantity: 1 },
      { quantity: 3 },
      { quantity: 2 },
    ]);
    expect(count).toBe(6);
  });

  it("calculates cart total", () => {
    const total = calculateCartTotal([
      { lockedPrice: 10, quantity: 2 },
      { lockedPrice: 5, quantity: 1 },
    ]);
    expect(total).toBe(25);
  });
});
