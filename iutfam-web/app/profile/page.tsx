"use client";

import { useEffect, useState } from "react";

type UserMe = {
  id: string;
  email: string;
  username?: string;
  displayName?: string | null;
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
      window.location.href = "/legacy/index.html";
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erreur lors de la suppression du compte.");
    }
  }

  function goBack() {
    window.location.href = "/legacy/index.html";
  }

  const fullName =
    (user?.firstName || "") + (user?.lastName ? ` ${user.lastName}` : "");


  const initials = user
  ? (
      (user.firstName?.[0] ?? "") +
      (user.lastName?.[0] ?? "")
    ).toUpperCase() ||
    (user.email?.[0] ?? "U").toUpperCase()
  : "U";

    return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#05030b",
        color: "#f8f6ff",
        padding: "40px 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {loading && <p>Chargement du profil...</p>}

      {!loading && !user && !error && (
        <p>
          Vous n&apos;êtes pas connecté(e). Retournez sur{" "}
          <a href="/legacy/index.html">la page d&apos;accueil</a> pour vous
          connecter.
        </p>
      )}

      {error && (
        <p style={{ color: "#ff6b81", marginBottom: 16 }}>
          {error}
        </p>
      )}

      {user && (
        <div
          style={{
            width: "100%",
            maxWidth: 960,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
            border: "1px solid #2b2245",
          }}
        >
          {/* Bandeau violet en haut, comme la carte d’évènement */}
          <div
            style={{
              background: "#2b0f56",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              <span>⚙️</span>
              <span>Mon profil</span>
            </div>

            <button
              className="btn btn--outline btn--sm"
              onClick={goBack}
            >
              ← Retour à l&apos;application
            </button>
          </div>

          {/* Corps sombre */}
          <div
            style={{
              background: "#0b0717",
              padding: "24px 24px 16px",
            }}
          >
            {/* Ligne avatar + infos principales */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid #2b2245",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      marginBottom: 4,
                    }}
                  >
                    {fullName || "Utilisateur IUTFAM"}
                  </div>
                  <div style={{ color: "#b4a9d6" }}>
                    {user.department || "Département inconnu"} •{" "}
                    {user.year || "Année non renseignée"}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#a093cf",
                  }}
                >
                  Nombre d&apos;amis
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    marginTop: 4,
                  }}
                >
                  {friendsCount === null ? "…" : friendsCount}
                </div>
              </div>
            </div>

            <hr
              style={{
                borderColor: "#2b2245",
                opacity: 0.8,
                margin: "8px 0 20px",
              }}
            />

            {/* Deux colonnes comme une carte d’évènement */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
                gap: 24,
              }}
            >
              <section>
                <h3 style={{ marginBottom: 8 }}>📚 Informations IUT</h3>
                <p>
                  <strong>Formation :</strong>{" "}
                  {user.department || "Non renseignée"}
                </p>
                <p>
                  <strong>Année :</strong>{" "}
                  {user.year || "Non renseignée"}
                </p>
              </section>

              <section>
                <h3 style={{ marginBottom: 8 }}>🔐 Informations du compte</h3>
                <p>
                  <strong>Email :</strong> {user.email}
                </p>
              </section>
            </div>
          </div>

          {/* Footer de carte avec les boutons */}
          <div
            style={{
              background: "#0b0717",
              borderTop: "1px solid #2b2245",
              padding: "12px 24px 16px",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <button
              className="btn btn--outline btn--sm"
              type="button"
              onClick={goBack}
            >
              ← Retour au tableau de bord
            </button>

            <button
              className="btn btn--outline btn--sm"
              style={{
                borderColor: "#ff6b81",
                color: "#ff6b81",
              }}
              type="button"
              onClick={handleDeleteAccount}
            >
              🗑️ Supprimer mon compte
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

