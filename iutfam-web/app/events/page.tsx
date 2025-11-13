import Link from "next/link";

type EventSummary = {
  id: string;
  title: string;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    username?: string | null;
    displayName?: string | null;
    department?: string | null; // "GEA", "RT", etc.
    classes?: {
      classGroup?: {
        name?: string | null; // ex: "BUT GEA 1"
      } | null;
    }[];
  };
  invites?: { status: string }[]; // si plus tard tu exposes ça dans l’API
};

function fmtDate(dt: string | null | undefined) {
  if (!dt) return "";
  return new Date(dt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function buildOrganiser(e: EventSummary): string {
  const u = e.createdBy;
  const name = u?.displayName || u?.username || u?.id || "Anonyme";

  const dept = u?.department?.trim();
  const className = u?.classes?.[0]?.classGroup?.name?.trim();
  const formation = dept || className || "";

  return formation ? `${name} (${formation})` : name;
}

function participantsLabel(e: EventSummary): string {
  const n = e.invites?.length ?? 0;
  if (n <= 0) return "Aucun participant pour le moment";
  if (n === 1) return "1 participant";
  return `${n} participants`;
}

export const dynamic = "force-dynamic";

export default async function EventsListPage() {
  // ⚠ CÔTÉ SERVEUR : on utilise l’URL interne Docker
  const base = process.env.API_INTERNAL_URL || "http://api:4000";

  let events: EventSummary[] = [];
  try {
    const res = await fetch(`${base}/events`, { cache: "no-store" });
    if (res.ok) {
      events = await res.json();
    } else {
      console.error("Erreur /events", res.status);
    }
  } catch (err) {
    console.error("Erreur fetch /events :", err);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Titre + onglets en haut */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span>🎉</span>
          <span>Événements</span>
        </h1>

        <div className="flex gap-2">
          <Link
            href="/events"
            className="px-3 py-2 rounded-xl bg-purple-800 text-sm text-white"
          >
            Événements
          </Link>
          <Link
            href="/events/new"
            className="px-3 py-2 rounded-xl bg-teal-600 text-sm text-white hover:bg-teal-500"
          >
            + Créer un événement
          </Link>
        </div>
      </div>

      {/* Liste des événements */}
      {events.length === 0 && (
        <p className="text-gray-400">
          Aucun événement pour le moment. Crée le premier 🎉
        </p>
      )}

      <div className="space-y-4">
        {events.map((ev) => {
          const organiser = buildOrganiser(ev);
          const dateStr = fmtDate(ev.startsAt);

          return (
            <div
              key={ev.id}
              className="rounded-2xl overflow-hidden border border-gray-700 bg-[#181126]"
            >
              {/* Bandeau titre + date */}
              <div className="flex items-center justify-between bg-[#2b1448] px-5 py-3">
                <h2 className="text-lg font-semibold">{ev.title}</h2>
                <span className="text-sm text-gray-300">{dateStr}</span>
              </div>

              {/* Corps de la carte */}
              <div className="px-5 py-4 space-y-2 text-sm">
                {ev.location && (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{ev.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span>{participantsLabel(ev)}</span>
                </div>

                <div className="text-gray-300">
                  Organisé par{" "}
                  <span className="font-medium">{organiser}</span>
                </div>
              </div>

              {/* Boutons en bas */}
              <div className="px-5 py-3 flex gap-3 border-t border-gray-700">
                <button
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm cursor-not-allowed opacity-70"
                  disabled
                >
                  Participer
                </button>
                <Link
                  href={`/events/${ev.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm hover:bg-slate-700"
                >
                  Détails
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
