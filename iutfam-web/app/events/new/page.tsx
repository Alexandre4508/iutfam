'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";


const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";


export default function NewEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);


  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setOkMsg(null); setBusy(true);


    try {
     const res = await fetch(`${API}/events`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",  // 👈 très important pour envoyer les cookies vers :4000
  body: JSON.stringify({
    title,
    location: location || undefined,
    description: description || undefined,
    startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
    endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
  }),
});



      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Erreur API (${res.status}) ${t}`);
      }


      const data = await res.json(); // { id }
      setOkMsg("Événement créé !");
      setTimeout(() => router.push(`/events/${data.id}`), 600);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Créer un événement</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Titre *</label>
          <input className="w-full border rounded-xl px-3 py-2"
                 value={title} onChange={e=>setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Lieu</label>
          <input className="w-full border rounded-xl px-3 py-2"
                 value={location} onChange={e=>setLocation(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Début *</label>
          <input type="datetime-local" className="w-full border rounded-xl px-3 py-2"
                 value={startsAt} onChange={e=>setStartsAt(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Fin</label>
          <input type="datetime-local" className="w-full border rounded-xl px-3 py-2"
                 value={endsAt} onChange={e=>setEndsAt(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="w-full border rounded-xl px-3 py-2"
                    rows={5}
                    value={description} onChange={e=>setDescription(e.target.value)} />
        </div>


        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl shadow border hover:bg-gray-50 disabled:opacity-50" disabled={busy}>
            {busy ? "Envoi..." : "Créer"}
          </button>
          <button type="button" onClick={() => history.back()} className="px-4 py-2 rounded-xl border">
            Annuler
          </button>
        </div>


        {okMsg && <div className="text-green-600">{okMsg}</div>}
        {error && <div className="text-red-600 whitespace-pre-wrap">{error}</div>}
      </form>
    </div>
  );
}
