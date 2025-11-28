import { notFound } from "next/navigation";
import styles from "../page.module.css";
import { parkRepository } from "@/lib/repositories/parkRepository";
import { TopNav } from "@/components/TopNav";
import { ParkCatalogClient, type ParkView } from "./ParkCatalogClient";

const fallbackCatalog: ParkView[] = [
  {
    parkId: "101",
    name: "Rainforest Ridge",
    dailyCapacity: 200,
    location: "Highlands",
    status: "OPEN",
    description: "Canopy walks and guided night safaris in lush rainforest.",
  },
  {
    parkId: "102",
    name: "Coral Bay Reserve",
    dailyCapacity: 300,
    location: "Coastal",
    status: "OPEN",
    description: "Marine park with snorkeling reefs and white sand beaches.",
  },
  {
    parkId: "103",
    name: "Granite Peak",
    dailyCapacity: 120,
    location: "Mountain",
    status: "CLOSED",
    description: "Challenging summit trail and alpine views (currently closed).",
  },
];

export default async function ParksPage() {
  const parks = await parkRepository.findAllParks();

  if (!parks) {
    notFound();
  }

  const catalog: ParkView[] = (parks.length
    ? parks
    : fallbackCatalog
  ).map((p) => ({
    parkId: p.parkId.toString(),
    name: p.name,
    dailyCapacity: p.dailyCapacity,
    location: (p as any).location ?? null,
    status: (p as any).status ?? "OPEN",
    description: (p as any).description,
  }));

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <TopNav title="Parks" subtitle="Browse, search, and filter" />

        <section className={styles.sectionBlock}>
          <div>
            <div className={styles.sectionTitle}>Park catalog</div>
            <p className={styles.sectionLead}>
              Filter by name, location, or status. Showing {catalog.length} parks.
            </p>
          </div>

          <ParkCatalogClient parks={catalog} />
        </section>
      </div>
    </main>
  );
}
