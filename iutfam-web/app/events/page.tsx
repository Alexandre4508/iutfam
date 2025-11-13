import Link from "next/link";

type EventListItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
  createdBy?: { id: string; username?: string | null; displayName?: string | null };

  // on prévoit plusieurs formats possibles côté API
  participantsCount?: number;
  _count?: { participants?: number };
  participants?: any[];
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getParticipantsCount(ev: EventListItem): number | undefined {
  if (typeof ev.participantsCount === "number") return ev.participantsCount;
  if (ev._count?.participants != null) return ev._count.participants;
  if (Array.isArray(ev.participants)) return ev.participants.length;
  return undefined;
}

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // récupère les évènements depuis l’API Nest
  const res = await fetch(`${base}/events`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">🎉 Événements</h1>
        <p className="text-red-500">
          Impossible de charger les événements (code {res.status}).
        </p>
      </div>
    );
  }

  const events: EventListItem[] = await res.json();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🎉 Événements</h1>
        <Link
          href="/events/new"
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-sm font-medium"
        >
          + Créer un événement
        </Link>
      </div>

      {events.length === 0 && (
        <p className="text-gray-400">
          Aucun événement pour l’instant. Sois le premier à en créer un ! 🚀
        </p>
      )}

      <div className="space-y-4">
        {events.map((ev) => {
          const participants = getParticipantsCount(ev);
          const organisateur =
            ev.createdBy?.displayName ||
            ev.createdBy?.username ||
            ev.createdBy?.id ||
            "Anonyme";

          return (
            <div
              key={ev.id}
              className="rounded-2xl overflow-hidden bg-slate-900/70 border border-slate-700"
            >
              {/* Bandeau titre + date */}
              <div className="flex items-center justify-between px-4 py-3 bg-purple-900/80">
                <h2 className="text-xl font-semibold">{ev.title}</h2>
                <span className="text-sm text-gray-200">
                  {formatDate(ev.startsAt)}
                </span>
              </div>

              {/* Corps de la carte */}
              <div className="px-4 py-4 space-y-2 text-sm">
                {ev.location && (
                  <p>
                    📍 <span className="font-medium">{ev.location}</span>
                  </p>
                )}

                {typeof participants === "number" && (
                  <p>👥 {participants} participant{participants > 1 ? "s" : ""}</p>
                )}

                <p>Organisé par {organisateur}</p>

                {ev.description && (
                  <p className="mt-2 text-gray-200">{ev.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex gap-2">
                <button
                  className="px-4 py-2 rounded-xl bg-emerald-600/80 text-sm font-medium cursor-not-allowed opacity-60"
                  disabled
                >
                  ✅ Participer (bientôt)
                </button>
                <Link
                  href={`/events/${ev.id}`}
                  className="px-4 py-2 rounded-xl border border-slate-500 text-sm font-medium hover:bg-slate-800"
                >
                  ℹ️ Détails
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
