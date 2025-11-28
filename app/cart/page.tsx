"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import { calculateItemCount, formatCurrency } from "@/lib/domain/domainHelpers";
import { TopNav, type UserSession } from "@/components/TopNav";

type Product = {
  productId: string;
  productName: string;
  unitPrice: number;
  type: "TICKET" | "MERCH";
};

type CartItem = {
  product: Product;
  quantity: number;
};

type FlashState = { type: "success" | "error" | "info"; text: string } | null;

export default function CartPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [flash, setFlash] = useState<FlashState>(null);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.unitPrice * item.quantity, 0),
    [cart]
  );

  const postFlash = (message: FlashState) => {
    setFlash(message);
    if (message) {
      setTimeout(() => setFlash(null), 3200);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("npopUser");
      localStorage.removeItem("npopCart");
    }
    postFlash({ type: "info", text: "Signed out." });
  };

  useEffect(() => {
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("npopUser") : null;
    if (storedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        // ignore
      }
    }
    const storedCart =
      typeof window !== "undefined" ? localStorage.getItem("npopCart") : null;
    if (storedCart) {
      try {
        const parsed: CartItem[] = JSON.parse(storedCart);
        setCart(parsed);
      } catch {
        // ignore
      }
    }
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products/list");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        postFlash({ type: "error", text: "Failed to load products." });
      }
    };
    void loadProducts();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("npopCart", JSON.stringify(cart));
    }
  }, [cart]);

  const updateQuantityInput = (productId: string, value: number) => {
    const safeValue = Number.isNaN(value) ? 1 : Math.max(1, value);
    setQuantities((prev) => ({ ...prev, [productId]: safeValue }));
  };

  const addProductToCart = (productId: string) => {
    if (!currentUser) {
      postFlash({ type: "error", text: "Log in on the home page before adding items." });
      return;
    }
    const product = products.find((p) => p.productId === productId);
    if (!product) return;
    const qty = Math.max(1, quantities[productId] ?? 1);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.product.productId === productId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    postFlash({ type: "success", text: `Added ${qty} x ${product.productName} to cart.` });
  };

  const setCartQuantity = (productId: string, quantity: number) => {
    const safeQty = Math.max(1, quantity);
    setCart((prev) =>
      prev.map((item) =>
        item.product.productId === productId ? { ...item, quantity: safeQty } : item
      )
    );
  };

  const removeCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.productId !== productId));
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      postFlash({ type: "error", text: "Log in to proceed." });
      return;
    }
    if (!cart.length) {
      postFlash({ type: "error", text: "Your cart is empty." });
      return;
    }
    router.push("/checkout");
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav
          title="Cart"
          subtitle="Products & checkout"
          user={currentUser}
          onLogout={handleLogout}
        />

        {flash && (
          <div
            className={`${styles.flash} ${
              flash.type === "success" ? styles.success : ""
            } ${flash.type === "error" ? styles.error : ""}`}
          >
            {flash.text}
          </div>
        )}

        {!currentUser && (
          <section className={styles.sectionBlock}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Login required</div>
              <p className={styles.cardDescription}>
                Please log in from the home page before adding items to your cart.
              </p>
              <div className={styles.buttonRow} style={{ marginTop: 12 }}>
                <Link className={styles.button} href="/#auth">
                  Go to login
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className={styles.sectionBlock}>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <div className={styles.cardTitle}>Products catalog</div>
                  <p className={styles.cardDescription}>
                    Tickets and merchandise; select quantities and add them to your cart.
                  </p>
                </div>
              </div>
              <div className={styles.list}>
                {products.map((product) => (
                  <div key={product.productId} className={styles.ticketRow}>
                    <div>
                      <div className={styles.ticketTitle}>{product.productName}</div>
                      <div className={styles.tinyLabel}>
                        Product {product.productId} · {product.type}
                      </div>
                    </div>
                    <div className={styles.muted}>{formatCurrency(product.unitPrice)}</div>
                    <div className={styles.buttonRow}>
                      <input
                        type="number"
                        className={styles.input}
                        min={1}
                        value={quantities[product.productId] ?? 1}
                        onChange={(e) =>
                          updateQuantityInput(product.productId, parseInt(e.target.value, 10))
                        }
                      />
                      <button
                        className={styles.button}
                        type="button"
                        onClick={() => addProductToCart(product.productId)}
                        disabled={!currentUser}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Cart</div>
              <p className={styles.cardDescription}>
                Review your items. You will choose payment method on the checkout page.
              </p>
              {cart.length === 0 ? (
                <div className={styles.cardDescription} style={{ marginTop: 12 }}>
                  Cart is empty. Add items from the catalog.
                </div>
              ) : (
                <>
                  <div className={styles.cartList}>
                    {cart.map((item) => (
                      <div key={item.product.productId} className={styles.cartItem}>
                        <div>
                          <div className={styles.ticketTitle}>{item.product.productName}</div>
                          <div className={styles.tinyLabel}>
                            {item.product.type} · {formatCurrency(item.product.unitPrice)} ea
                          </div>
                        </div>
                        <div className={styles.buttonRow}>
                          <input
                            type="number"
                            min={1}
                            className={styles.input}
                            value={item.quantity}
                            onChange={(e) =>
                              setCartQuantity(
                                item.product.productId,
                                parseInt(e.target.value, 10) || 1
                              )
                            }
                          />
                          <button
                            className={`${styles.button} ${styles.buttonSecondary}`}
                            type="button"
                            onClick={() => removeCartItem(item.product.productId)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.sectionHeader} style={{ marginTop: 12 }}>
                    <div className={styles.label}>Total</div>
                    <div className={styles.statValue}>{formatCurrency(cartTotal)}</div>
                  </div>
                  <div className={styles.buttonRow}>
                    <button
                      className={styles.button}
                      type="button"
                      onClick={handleCheckout}
                      disabled={!currentUser || !cart.length}
                    >
                      Go to checkout
                    </button>
                    <button
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      type="button"
                      onClick={() => setCart([])}
                    >
                      Clear cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
