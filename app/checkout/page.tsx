"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "@/app/page.module.css";
import { TopNav } from "@/components/TopNav";
import type { UserSession } from "@/components/TopNav";

type Product = { productId: string; productName: string; unitPrice: number; type: string };
type CartItem = { product: Product; quantity: number };
type Flash = { type: "success" | "error"; text: string } | null;

export default function CheckoutPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [cardNumber, setCardNumber] = useState("");
  const [walletChoice, setWalletChoice] = useState("grabpay");
  const [flash, setFlash] = useState<Flash>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("npopUser") : null;
    if (stored) {
      try {
        const parsed: UserSession = JSON.parse(stored);
        setUser(parsed);
      } catch {
        /* ignore */
      }
    }
    const storedCart =
      typeof window !== "undefined" ? localStorage.getItem("npopCart") : null;
    if (storedCart) {
      try {
        const parsed: CartItem[] = JSON.parse(storedCart);
        setCart(parsed);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.unitPrice * item.quantity, 0),
    [cart]
  );

  const checkout = async () => {
    setFlash(null);
    if (!user?.userId) {
      setFlash({ type: "error", text: "Please log in before checking out." });
      return;
    }
    if (!cart.length) {
      setFlash({ type: "error", text: "Add at least one item to cart" });
      return;
    }
    if (paymentMethod === "CARD" && !cardNumber.trim()) {
      setFlash({ type: "error", text: "Enter your card number." });
      return;
    }
    if (paymentMethod === "WALLET" && !walletChoice) {
      setFlash({ type: "error", text: "Choose an e-wallet provider." });
      return;
    }
    const payload = {
      userId: user.userId,
      cartItems: cart.map((c) => ({ productId: c.product.productId, quantity: c.quantity })),
      paymentMethod,
      cardNumber,
      walletChoice,
    };
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFlash({ type: "error", text: data.message ?? "Checkout failed" });
        return;
      }
      setFlash({ type: "success", text: data.message ?? "Order confirmed" });
      setCart([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem("npopCart");
      }
    } catch (err) {
      console.error(err);
      setFlash({ type: "error", text: "Checkout failed" });
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav title="Checkout" subtitle="Confirm your booking" />

        {flash && (
          <div
            className={`${styles.flash} ${
              flash.type === "success" ? styles.success : ""
            } ${flash.type === "error" ? styles.error : ""}`}
          >
            {flash.text}
          </div>
        )}

        <div className={styles.hero}>
          <div>
            <p className={styles.overline}>Checkout</p>
            <h1 className={styles.heroTitle}>Confirm your booking</h1>
            <p className={styles.heroSubtitle}>
              Add items, choose payment, and simulate the end-to-end checkout flow.
            </p>
            <div className={styles.heroBadges}>
              <span className={styles.badge}>Payment strategy enabled</span>
              <span className={styles.badge}>Ticket issuance on success</span>
              <span className={styles.badge}>
                {user ? `Signed in as ${user.email}` : "Login required"}
              </span>
            </div>
          </div>
          <div className={styles.statStrip}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Cart items</div>
              <div className={styles.statValue}>{cart.length}</div>
              <div className={styles.mutedSmall}>Select products below</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total</div>
              <div className={styles.statValue}>${cartTotal.toFixed(2)}</div>
              <div className={styles.mutedSmall}>Live calculation</div>
            </div>
          </div>
        </div>

        <section className={styles.sectionBlock}>
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.cardTitle}>Payment &amp; submit</div>
                <p className={styles.cardDescription}>
                  Cart items are brought over from your cart. If you need to change quantities,
                  return to the cart page.
                </p>
              </div>
              <div className={styles.inlineStat}>
                <div className={styles.mutedSmall}>Total</div>
                <div className={styles.ticketTitle}>${cartTotal.toFixed(2)}</div>
              </div>
            </div>
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Payment method</label>
                <select
                  className={styles.select}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="CARD">Card</option>
                  <option value="WALLET">E-wallet</option>
                  <option value="DUMMY">Cash</option>
                </select>
              </div>
              {paymentMethod === "CARD" && (
                <div className={styles.field}>
                  <label className={styles.label}>Card number</label>
                  <input
                    className={styles.input}
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    inputMode="numeric"
                    pattern="[0-9]{12,19}"
                    minLength={12}
                    maxLength={19}
                    required
                  />
                </div>
              )}
              {paymentMethod === "WALLET" && (
                <div className={styles.field}>
                  <label className={styles.label}>Choose e-wallet</label>
                  <select
                    className={styles.select}
                    value={walletChoice}
                    onChange={(e) => setWalletChoice(e.target.value)}
                    required
                  >
                    <option value="grabpay">GrabPay</option>
                    <option value="tng">Touch 'n Go</option>
                    <option value="boost">Boost</option>
                    <option value="shopeedigital">ShopeePay</option>
                  </select>
                </div>
              )}
            </div>

            <div className={styles.checkoutPanel}>
              <div className={styles.sectionHeader}>
                <div className={styles.cardTitle}>Cart items</div>
                <Link className={styles.link} href="/cart">
                  Edit quantities in cart
                </Link>
              </div>
              {cart.length === 0 ? (
                <div className={styles.cardDescription} style={{ marginTop: 10 }}>
                  No items yet. Add products in the cart page.
                </div>
              ) : (
                <div className={styles.cartList}>
                  {cart.map((item) => (
                    <div key={item.product.productId} className={styles.cartItem}>
                      <div>
                        <div className={styles.ticketTitle}>{item.product.productName}</div>
                        <div className={styles.tinyLabel}>
                          {item.quantity} × ${item.product.unitPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.buttonRow} style={{ marginTop: 12 }}>
              <button className={styles.button} type="button" onClick={checkout}>
                Simulate checkout
              </button>
              <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/cart">
                Back to cart
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
