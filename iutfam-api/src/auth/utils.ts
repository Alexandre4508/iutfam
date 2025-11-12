const raw = process.env.ALLOWED_EMAIL_DOMAINS ?? 'etu-iut.re,univ-reunion.fr,iut.re';
const allowed = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export function isEmailAllowed(email: string): boolean {
  if (allowed.includes('*')) return true;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  // supporte "*.univ-reunion.fr"
  return allowed.some(d => {
    if (d.startsWith('*.')) return domain.endsWith(d.slice(1));
    return domain === d;
  });
}
