"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "../page.module.css";

export type ParkView = {
  parkId: string;
  name: string;
  dailyCapacity: number;
  location: string | null;
  status: string;
  description?: string;
};

export function ParkCatalogClient({ parks }: { parks: ParkView[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [location, setLocation] = useState("ALL");

  const locations = useMemo(
    () => Array.from(new Set(parks.map((p) => p.location ?? "Unknown"))),
    [parks]
  );

  const filtered = parks.filter((p) => {
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.location ?? "").toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "ALL" || p.status === status;
    const matchesLocation = location === "ALL" || (p.location ?? "Unknown") === location;
    return matchesQuery && matchesStatus && matchesLocation;
  });

  return (
    <>
      <div className={styles.card} style={{ marginTop: 12 }}>
        <div className={styles.controlRow}>
          <div className={styles.field}>
            <label className={styles.label}>Search</label>
            <input
              className={styles.input}
              placeholder="Search by name or location"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value as "ALL" | "OPEN" | "CLOSED")}
            >
              <option value="ALL">All</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Location</label>
            <select
              className={styles.select}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="ALL">All</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.list}>
        {filtered.map((park) => (
          <div key={park.parkId} className={styles.park}>
            <div className={styles.parkHeader}>
              <div>
                <div className={styles.ticketTitle}>
                  <Link className={styles.link} href={`/parks/${park.parkId}`}>
                    {park.name}
                  </Link>
                </div>
                <div className={styles.tinyLabel}>
                  Park ID {park.parkId} · Daily capacity {park.dailyCapacity} ·{" "}
                  {park.location ?? "Unknown"}
                </div>
                {park.description && (
                  <div className={styles.cardDescription}>{park.description}</div>
                )}
              </div>
              <span className={styles.pill}>{park.status}</span>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className={styles.cardDescription}>No parks match your filters.</div>
        )}
      </div>
    </>
  );
}
