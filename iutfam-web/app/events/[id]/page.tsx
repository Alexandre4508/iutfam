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
  // ⚠️ avec Next 15, params est une Promise → on attend
  const { id } = await props.params;

  // ⚠ côté serveur → URL interne Docker
  const base = process.env.API_INTERNAL_URL || "http://api:4000";
  const res = await fetch(`${base}/events/${id}`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600">Événement introuvable.</p>
        <Link href="/events" className="underline">
          ← Retour
        </Link>
      </div>
    );
  }

  const ev: EventDetail = await res.json();
  const organiserLabel = buildOrganiser(ev);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Link href="/events" className="underline">
        ← Retour à la liste
      </Link>

      <h1 className="text-2xl font-semibold">{ev.title}</h1>

      <div className="text-gray-600">
        {ev.location ? ev.location + " • " : ""}
        {fmt(ev.startsAt)}
        {ev.endsAt ? " → " + fmt(ev.endsAt) : ""}
      </div>

      {ev.description && (
        <p className="whitespace-pre-wrap">{ev.description}</p>
      )}

      <div className="text-sm text-gray-500">
        Organisé par {organiserLabel}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          className="px-3 py-1 rounded-lg border text-gray-400 cursor-not-allowed"
          disabled
        >
          Participer (désactivé)
        </button>
      </div>
    </div>
  );
}
