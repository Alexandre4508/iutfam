
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
  createdBy?: { id: string; username?: string | null; displayName?: string | null };
};

function fmt(dt: string | null) {
  if (!dt) return "";
  return new Date(dt).toLocaleString();
}

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
 const base = process.env.API_INTERNAL_URL || "http://api:4000";
  const res = await fetch(`${base}/events/${params.id}`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600">Événement introuvable.</p>
        <Link href="/events" className="underline">← Retour</Link>
      </div>
    );
  }

  const ev: EventDetail = await res.json();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Link href="/events" className="underline">← Retour à la liste</Link>
      <h1 className="text-2xl font-semibold">{ev.title}</h1>

      <div className="text-gray-600">
        {ev.location ? ev.location + " • " : ""}
        {fmt(ev.startsAt)}
        {ev.endsAt ? " → " + fmt(ev.endsAt) : ""}
      </div>

      {ev.description && <p className="whitespace-pre-wrap">{ev.description}</p>}

      <div className="text-sm text-gray-500">
        Créé par : {ev.createdBy?.displayName || ev.createdBy?.username || ev.createdBy?.id}
      </div>

      <div className="flex gap-2 pt-2">
        <button className="px-3 py-1 rounded-lg border text-gray-400 cursor-not-allowed" disabled>
          Participer (désactivé)
        </button>
      </div>
    </div>
  );
}
