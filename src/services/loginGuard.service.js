// Schutz gegen Durchprobieren von Passwörtern: höchstens MAX_FAILS Fehlversuche pro IP im Zeitfenster.
// Nur im Arbeitsspeicher, nichts wird gespeichert.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 10;

const fails = new Map();

const recent = (ip) => (fails.get(ip) || []).filter((time) => Date.now() - time < WINDOW_MS);

export function isLoginBlocked(ip) {
  const list = recent(ip);
  fails.set(ip, list);
  return list.length >= MAX_FAILS;
}

export function recordLoginFailure(ip) {
  fails.set(ip, [...recent(ip), Date.now()]);
}

export function resetLoginFailures(ip) {
  fails.delete(ip);
}

setInterval(() => {
  for (const ip of fails.keys()) if (recent(ip).length === 0) fails.delete(ip);
}, WINDOW_MS).unref();
