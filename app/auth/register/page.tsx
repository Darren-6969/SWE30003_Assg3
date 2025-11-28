"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/app/page.module.css";
import { TopNav } from "@/components/TopNav";

type Flash = { type: "success" | "error"; text: string } | null;

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [flash, setFlash] = useState<Flash>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlash(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFlash({ type: "error", text: data.message ?? "Registration failed" });
        return;
      }
      setFlash({ type: "success", text: data.message ?? "Account created" });
      setPassword("");
    } catch (err) {
      console.error(err);
      setFlash({ type: "error", text: "Registration failed" });
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav title="Register" subtitle="Create your National Parks account" />

        {flash && (
          <div
            className={`${styles.flash} ${
              flash.type === "success" ? styles.success : ""
            } ${flash.type === "error" ? styles.error : ""}`}
          >
            {flash.text}
          </div>
        )}

        <section className={styles.sectionBlock}>
          <div>
            <div className={styles.sectionTitle}>Create an account</div>
            <p className={styles.sectionLead}>
              Enter your details to start booking park tickets and managing orders.
            </p>
          </div>

          <div className={styles.card}>
            <form className={styles.form} onSubmit={handleRegister}>
              <div className={styles.field}>
                <label className={styles.label}>Full name</label>
                <input
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
              <div className={styles.buttonRow}>
                <button className={styles.button} type="submit">
                  Create account
                </button>
                <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/auth/login">
                  Already registered? Log in
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
