import Link from "next/link";

type EventDetail = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    username?: string | null;
    displayName?: string | null;
    department?: string | null;
    classes?: {
      classGroup?: {
        name?: string | null;
      } | null;
    }[];
  };
};

function fmt(dt: string | null | undefined) {
  if (!dt) return "";
  return new Date(dt).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildOrganiser(ev: EventDetail): string {
  const u = ev.createdBy;
  const name = u?.displayName || u?.username || u?.id || "Anonyme";

  const dept = u?.department?.trim();
  const className = u?.classes?.[0]?.classGroup?.name?.trim();
  const formation = dept || className || "";

  return formation ? `${name} (${formation})` : name;
}

export const dynamic = "force-dynamic";

export default async function EventDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  // ⚠️ Next 15 → params est une Promise
  const { id } = await props.params;

  const base = process.env.API_INTERNAL_URL || "http://api:4000";
  const res = await fetch(`${base}/events/${id}`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className="min-h-screen bg-[#05060b] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-xl space-y-4">
          <Link
            href="/legacy/index.html#events"
            className="inline-flex items-center text-sm text-teal-300 hover:text-teal-200"
          >
            ← Retour au site IUTFAM
          </Link>

          <div className="rounded-3xl border border-red-500/50 bg-red-500/10 px-6 py-4 text-sm">
            <p className="font-semibold text-red-200 mb-1">
              Événement introuvable
            </p>
            <p className="text-red-100/80">
              L’événement demandé n’existe plus ou vous n’y avez pas accès.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const ev: EventDetail = await res.json();
  const organiserLabel = buildOrganiser(ev);

  return (
    <div className="min-h-screen bg-[#05060b] text-white flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-4">
        {/* Lien retour vers TON site */}
        <Link
          href="/legacy/index.html#events"
          className="inline-flex items-center text-sm text-teal-300 hover:text-teal-200"
        >
          ← Retour au site IUTFAM
        </Link>

        {/* Carte détaillée de l’événement */}
        <div className="rounded-3xl border border-purple-900/60 bg-[#090918] shadow-2xl overflow-hidden">
          {/* Bandeau haut style cartes événements */}
          <div className="bg-[#30124d] px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-fuchsia-300/80 mb-1">
                🎉 Événement
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                {ev.title}
              </h1>
            </div>
            <div className="text-right text-sm text-slate-200">
              <div>{fmt(ev.startsAt)}</div>
              {ev.endsAt && (
                <div className="text-xs text-slate-400">
                  jusqu&apos;à {fmt(ev.endsAt)}
                </div>
              )}
            </div>
          </div>

          {/* Contenu */}
          <div className="px-6 py-5 space-y-4">
            {/* Lieu + horaires synthèse */}
            <div className="text-sm text-slate-300 space-y-1">
              {ev.location && (
                <p className="flex items-center gap-2">
                  <span className="text-pink-400">📍</span>
                  <span>{ev.location}</span>
                </p>
              )}
            </div>

            {/* Description */}
            {ev.description && (
              <div className="rounded-2xl border border-slate-800 bg-black/20 px-4 py-3">
                <p className="text-sm whitespace-pre-wrap text-slate-100">
                  {ev.description}
                </p>
              </div>
            )}

            {/* Organisateur */}
            <div className="text-xs text-slate-400">
              Organisé par{" "}
              <span className="text-slate-100 font-medium">
                {organiserLabel}
              </span>
            </div>

            {/* Boutons */}
            <div className="flex justify-end pt-4">
              <button
                disabled
                className="rounded-xl border border-slate-600 bg-transparent px-5 py-2 text-sm text-slate-300 cursor-not-allowed"
              >
                Participer (désactivé)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
