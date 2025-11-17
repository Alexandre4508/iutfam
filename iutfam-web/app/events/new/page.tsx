"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function NewEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 🔐 Récupère le JWT mis en localStorage par la page legacy
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("jwt") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("token")
          : null;

      if (!token) {
        setError("Vous devez être connecté pour créer un événement.");
        setLoading(false);
        return;
      }

      const body = {
        title,
        location: location || null,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        description: description || null,
        published: true,
      };

      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Erreur ${res.status}`);
      }

      // ✅ Retour vers la page événements de TON site legacy
      router.push("/legacy/index.html#events");
    } catch (err: any) {
      setError(err.message || String(err));
      setLoading(false);
    }
  }

  function handleCancel() {
    // Retour visuel vers les événements du site
    router.push("/legacy/index.html#events");
  }

  return (
    <div className="min-h-screen bg-[#05060b] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl border border-purple-900/60 bg-[#090918] shadow-2xl overflow-hidden">
        {/* Bandeau titre dans le style des cartes d’événements */}
        <div className="bg-[#30124d] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-fuchsia-300/80 mb-1">
              🎉 Gestion des événements
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Créer un événement
            </h1>
          </div>
        </div>

        {/* Contenu du formulaire */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Titre */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-100">
              Titre <span className="text-pink-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-black/40 px-3 py-2.5 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              placeholder="Ex : Repas promo GEA, Soirée jeux, Café réseaux…"
            />
          </div>

          {/* Lieu */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-100">
              Lieu
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-black/40 px-3 py-2.5 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              placeholder="Ex : Saint-Pierre, Salle B204, Terrain de foot…"
            />
          </div>

          {/* Dates dans un bloc type carte, 2 colonnes */}
          <div className="rounded-2xl border border-slate-800 bg-black/20 px-4 py-4 space-y-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Horaires
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-100">
                  Début <span className="text-pink-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-black/40 px-3 py-2.5 text-sm text-slate-100 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-100">
                  Fin (optionnel)
                </label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-black/40 px-3 py-2.5 text-sm text-slate-100 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Les horaires sont affichés aux étudiants dans leur fuseau
              horaire.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-100">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-700 bg-black/40 px-3 py-2.5 text-sm resize-y focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              placeholder="Ex : Rencontre informelle des étudiants RT, chacun ramène quelque chose à boire / à grignoter…"
            />
          </div>

          {/* Boutons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-slate-700 bg-transparent px-4 py-2 text-sm text-slate-200 hover:bg-slate-800/70 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#00c5d4] px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-cyan-500/30 hover:bg-[#00d5e5] disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Création..." : "Créer l’événement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
