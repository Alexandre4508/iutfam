"use client";

import { useEffect, useState } from "react";

type UserMe = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  department?: string | null; // GEA, RT, etc.
  year?: string | null;       // "1ère année", "2ème année", ...
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [friendsCount, setFriendsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // 1) /users/me
        const meRes = await fetch(`${API_BASE}/users/me`, {
          credentials: "include",
        });
        if (!meRes.ok) {
          throw new Error("Impossible de récupérer vos informations.");
        }
        const meData: UserMe = await meRes.json();
        setUser(meData);

        // 2) /friends/me pour le nombre d'amis
        const frRes = await fetch(`${API_BASE}/friends/me`, {
          credentials: "include",
        });
        if (frRes.ok) {
          const friends = await frRes.json();
          setFriendsCount(Array.isArray(friends) ? friends.length : 0);
        } else {
          setFriendsCount(null);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erreur lors du chargement du profil.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [API_BASE]);

  async function handleDeleteAccount() {
    if (!window.confirm("Tu es sûr(e) de vouloir supprimer ton compte ?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Suppression impossible pour le moment.");
      }

      alert("Compte supprimé. Vous allez être déconnecté(e).");
      // On renvoie vers la page d’accueil legacy
      window.location.href = "/legacy/index.html";
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erreur lors de la suppression du compte.");
    }
  }

  function goBack() {
    // Retour au tableau de bord legacy
    window.location.href = "/legacy/index.html";
  }

  const fullName =
    (user?.firstName || "") + (user?.lastName ? ` ${user.lastName}` : "");

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
        padding: "32px 16px",
      }}
    >
      <div
        className="container"
        style={{ maxWidth: 800, margin: "0 auto" }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <h1 style={{ margin: 0 }}>⚙️ Mon profil</h1>
          <button className="btn btn--outline btn--sm" onClick={goBack}>
            ← Retour à l&apos;application
          </button>
        </header>

        {loading && <p>Chargement du profil...</p>}

        {error && (
          <p style={{ color: "var(--color-error)", marginBottom: 16 }}>
            {error}
          </p>
        )}

        {!loading && !user && !error && (
          <p>
            Vous n&apos;êtes pas connecté(e). Retournez sur{" "}
            <a href="/legacy/index.html">la page d&apos;accueil</a> pour
            vous connecter.
          </p>
        )}

        {user && (
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ marginBottom: 8 }}>
                {fullName || "Utilisateur IUTFAM"}
              </h2>
              <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                {user.department || "Département inconnu"} •{" "}
                {user.year || "Année non renseignée"}
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}>Informations du compte</h3>
              <p>
                <strong>Email :</strong> {user.email}
              </p>
              <p>
                <strong>Formation :</strong>{" "}
                {user.department || "Non renseignée"}
              </p>
              <p>
                <strong>Année :</strong> {user.year || "Non renseignée"}
              </p>
              <p>
                <strong>Nombre d&apos;amis :</strong>{" "}
                {friendsCount === null
                  ? "…"
                  : `${friendsCount} ami(s)`}
              </p>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                paddingTop: 16,
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <button className="btn btn--secondary" onClick={goBack}>
                ← Retour au tableau de bord
              </button>
              <button
                className="btn btn--outline"
                style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
                onClick={handleDeleteAccount}
              >
                🗑️ Supprimer mon compte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
