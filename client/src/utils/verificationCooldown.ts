const COOLDOWN_MS = 60 * 1000;

const getStorageKey = (email: string) => {
  return `verification-resend:${email.trim().toLowerCase()}`;
};

export const startVerificationCooldown = (
  email: string
) => {
  const expiresAt = Date.now() + COOLDOWN_MS;

  sessionStorage.setItem(
    getStorageKey(email),
    String(expiresAt)
  );
};

export const getRemainingCooldown = (
  email: string
): number => {
  if (!email.trim()) return 0;

  const key = getStorageKey(email);
  const storedValue = sessionStorage.getItem(key);

  if (!storedValue) return 0;

  const expiresAt = Number(storedValue);

  if (!Number.isFinite(expiresAt)) {
    sessionStorage.removeItem(key);
    return 0;
  }

  const remaining = Math.max(
    0,
    Math.ceil((expiresAt - Date.now()) / 1000)
  );

  if (remaining === 0) {
    sessionStorage.removeItem(key);
  }

  return remaining;
};