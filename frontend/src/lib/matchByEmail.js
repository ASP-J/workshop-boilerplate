// =============================================================================
// Cruza linhas de uma planilha com usuários da Twygo pelo e-mail.
// Compara sem diferenciar maiúsculas/minúsculas e ignorando espaços nas pontas.
//
//   matchByEmail(rows, "email", users)
//   -> { matched: [{ row, user }], unmatched: [row], total, emails: { total, matched } }
//
// "total" conta LINHAS; "emails" conta PESSOAS (e-mails diferentes), porque uma
// mesma pessoa pode aparecer em várias linhas (ex.: um curso por linha).
// =============================================================================

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function matchByEmail(rows, emailColumn, users, userEmailKey = "email") {
  const usersByEmail = new Map();
  for (const user of users ?? []) {
    const email = normalizeEmail(user?.[userEmailKey]);
    if (email && !usersByEmail.has(email)) usersByEmail.set(email, user);
  }

  const matched = [];
  const unmatched = [];
  const allEmails = new Set();
  const matchedEmails = new Set();
  for (const row of rows ?? []) {
    const email = normalizeEmail(row?.[emailColumn]);
    if (email) allEmails.add(email);
    const user = usersByEmail.get(email);
    if (user) {
      matched.push({ row, user });
      matchedEmails.add(email);
    } else unmatched.push(row);
  }
  return { matched, unmatched, total: (rows ?? []).length, emails: { total: allEmails.size, matched: matchedEmails.size } };
}

/** Adivinha qual coluna da planilha tem e-mail (pelo nome ou pelo conteúdo). */
export function guessEmailColumn(columns, rows = []) {
  const byName = (columns ?? []).find((c) => /e_?mail/.test(c));
  if (byName) return byName;
  return (columns ?? []).find((c) => rows.slice(0, 20).some((r) => /\S+@\S+\.\S+/.test(String(r?.[c] ?? "")))) ?? "";
}
