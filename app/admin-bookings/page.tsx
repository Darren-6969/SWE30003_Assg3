"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { TopNav, type UserSession } from "@/components/TopNav";

type Booking = {
  ticketId: string;
  orderId: string; // maps to order_items.order_id
  parkName: string;
  status: string;
  visitDate: string;
};

type Flash = { type: "success" | "error"; text: string } | null;

export default function AdminBookingsPage() {
  const [sessionUser, setSessionUser] = useState<UserSession | null>(null);
  const [userId, setUserId] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newDate, setNewDate] = useState("");
  const [selectedTicket, setSelectedTicket] = useState("");
  const [flash, setFlash] = useState<Flash>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("npopUser") : null;
    if (stored) {
      try {
        const parsed: UserSession = JSON.parse(stored);
        setSessionUser(parsed);
        setUserId(parsed.userId ?? "");
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/bookings", {
          headers: { "x-admin-email": sessionUser?.email ?? "" },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message ?? "Failed to load bookings");
        }
        setBookings(data.tickets as Booking[]);
      } catch (err: any) {
        console.error(err);
        setFlash({ type: "error", text: err?.message ?? "Failed to load bookings" });
      }
    };
    if (sessionUser?.email === "admin@admin.com") {
      void load();
    }
  }, [sessionUser]);

  const callCancel = async (ticketId: string) => {
    setFlash(null);
    try {
      const res = await fetch(`/api/bookings/${ticketId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFlash({ type: "error", text: data.message ?? "Cancel failed" });
        return;
      }
      setFlash({ type: "success", text: data.message ?? "Ticket cancelled" });
      setBookings((prev) =>
        prev.map((b) => (b.ticketId === ticketId ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (err) {
      console.error(err);
      setFlash({ type: "error", text: "Cancel failed" });
    }
  };

  const callReschedule = async () => {
    if (!selectedTicket || !newDate) {
      setFlash({ type: "error", text: "Select ticket and new date" });
      return;
    }
    setFlash(null);
    try {
      const res = await fetch(`/api/bookings/${selectedTicket}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFlash({ type: "error", text: data.message ?? "Reschedule failed" });
        return;
      }
      setFlash({ type: "success", text: data.message ?? "Ticket rescheduled" });
      setBookings((prev) =>
        prev.map((b) =>
          b.ticketId === selectedTicket ? { ...b, status: "RESCHEDULED", visitDate: newDate } : b
        )
      );
    } catch (err) {
      console.error(err);
      setFlash({ type: "error", text: "Reschedule failed" });
    }
  };

  const groupedBookings = bookings.reduce<Record<string, Booking[]>>((acc, booking) => {
    const orderKey = (() => {
      try {
        return BigInt(booking.orderId).toString();
      } catch {
        return booking.orderId;
      }
    })();
    acc[orderKey] = acc[orderKey] || [];
    acc[orderKey].push(booking);
    return acc;
  }, {});
  const groupedEntries = Object.entries(groupedBookings).sort((a, b) => {
    const aNum = BigInt(a[0] || 0);
    const bNum = BigInt(b[0] || 0);
    return Number(bNum - aNum);
  });

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav title="Admin bookings" subtitle="Reschedule or cancel tickets" user={sessionUser} />

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
            <p className={styles.overline}>Booking management</p>
            <h1 className={styles.heroTitle}>Reschedule or cancel tickets</h1>
            <p className={styles.heroSubtitle}>
              Each entry below is wired to the booking service APIs for Section 6 evidence.
            </p>
            <div className={styles.heroBadges}>
              <span className={styles.badge}>Cancel ticket</span>
              <span className={styles.badge}>Reschedule date</span>
            </div>
          </div>
          <div className={styles.statStrip}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Tickets</div>
              <div className={styles.statValue}>{bookings.length}</div>
              <div className={styles.mutedSmall}>Live from database</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>User ID</div>
              <div className={styles.statValue}>{userId || "Not set"}</div>
              <div className={styles.mutedSmall}>Paste from login</div>
            </div>
          </div>
        </div>

        <section className={styles.sectionBlock}>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <div className={styles.cardTitle}>Manage user booking</div>
                  <p className={styles.cardDescription}>
                    Each row exposes Reschedule and Cancel actions wired to the booking APIs.
                  </p>
                </div>
                <div className={styles.inlineStat}>
                  <div className={styles.mutedSmall}>User ID</div>
                  <div className={styles.ticketTitle}>{userId || "Paste from login"}</div>
                </div>
              </div>

              <div className={styles.list}>
                {groupedEntries.map(([orderId, tickets]) => (
                  <div key={orderId} className={styles.park}>
                    <div className={styles.sectionHeader}>
                      <div>
                        <div className={styles.ticketTitle}>Order #{orderId}</div>
                        <div className={styles.tinyLabel}>
                          {tickets.length} ticket{tickets.length === 1 ? "" : "s"} from
                          {" order_items.order_id = " + orderId}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {tickets.map((booking) => (
                        <div
                          key={booking.ticketId}
                          className={styles.sectionHeader}
                          style={{ padding: "8px 0" }}
                        >
                          <div>
                            <div className={styles.ticketTitle}>Ticket #{booking.ticketId}</div>
                            <div className={styles.tinyLabel}>
                              {booking.parkName} ·{" "}
                              {new Date(booking.visitDate).toLocaleDateString()}
                            </div>
                            <div className={styles.mutedSmall}>Status: {booking.status}</div>
                          </div>
                          <div className={styles.buttonRow}>
                            <button
                              type="button"
                              className={`${styles.button} ${styles.buttonSecondary}`}
                              onClick={() => setSelectedTicket(booking.ticketId)}
                            >
                              Select
                            </button>
                            <button
                              type="button"
                              className={styles.button}
                              onClick={() => callCancel(booking.ticketId)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <div className={styles.cardTitle}>Reschedule</div>
                  <p className={styles.cardDescription}>
                    Select a ticket, pick a date, and call the reschedule API.
                  </p>
                </div>
              </div>
              <div className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Selected ticket</label>
                  <input
                    className={styles.input}
                    value={selectedTicket}
                    onChange={(e) => setSelectedTicket(e.target.value)}
                    placeholder="Ticket ID"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>New visit date</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
              <div className={styles.buttonRow} style={{ marginTop: 10 }}>
                <button className={styles.button} type="button" onClick={callReschedule}>
                  Reschedule ticket
                </button>
                <Link className={`${styles.button} ${styles.buttonSecondary}`} href="/orders">
                  View orders
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
