import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../page.module.css";
import { parkRepository } from "@/lib/repositories/parkRepository";

type Props = { params: { id: string } };

export default async function ParkDetailPage({ params }: Props) {
  let parkId: bigint;
  try {
    parkId = BigInt(params.id);
  } catch {
    notFound();
  }
  const park = await parkRepository.findById(parkId);
  if (!park) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topNav}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>NPOP</div>
            <div>
              <div className={styles.brandTitle}>Park Detail</div>
              <div className={styles.brandSub}>Ticket reference</div>
            </div>
          </div>
          <div className={styles.topLinks}>
            <Link className={styles.navLink} href="/">
              Visitor view
            </Link>
            <Link className={styles.navLink} href="/admin">
              Admin
            </Link>
          </div>
        </header>

        <div className={styles.hero}>
          <div>
            <p className={styles.overline}>Park detail</p>
            <h1 className={styles.heroTitle}>{park.name}</h1>
            <p className={styles.heroSubtitle}>
              Park ID: {park.parkId.toString()} · Daily capacity: {park.dailyCapacity}. Tickets map
              to the Product abstraction in the domain diagram.
            </p>
            <div className={styles.heroBadges}>
              <span className={styles.badge}>Capacity anchored to parks table</span>
              <span className={styles.badge}>Products catalog holds ticket SKUs</span>
            </div>
          </div>
        </div>

        <div className={styles.sectionBlock}>
          <div>
            <div className={styles.sectionTitle}>How to use this park</div>
            <p className={styles.sectionLead}>
              Capacity and metadata live here; actual sellable ticket SKUs live in the products
              table (type = TICKET). Navigate back to the catalog to add tickets to your cart.
            </p>
          </div>
          <div className={styles.list}>
            <div className={styles.park}>
              <div className={styles.parkHeader}>
                <div>
                  <div className={styles.ticketTitle}>Park record</div>
                  <div className={styles.tinyLabel}>
                    This entry comes straight from the parks table (park_id {park.parkId.toString()}
                    ).
                  </div>
                </div>
                <span className={styles.pill}>Capacity {park.dailyCapacity}</span>
              </div>
              <div className={styles.cardDescription} style={{ marginTop: 8 }}>
                Need tickets? Return to the catalog and pick products of type &quot;TICKET&quot;.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
