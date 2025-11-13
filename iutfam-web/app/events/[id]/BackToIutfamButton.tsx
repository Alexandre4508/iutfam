"use client";

export function BackToIutfamButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="underline text-blue-400 hover:text-blue-300"
    >
      ← Retour à la page précédente
    </button>
  );
}
