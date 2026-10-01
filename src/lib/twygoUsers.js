// =============================================================================
// Transforma a resposta da Twygo em linhas simples para a tela:
//   { id, nome, email, departamento }
// A API às vezes manda "name", às vezes "first_name" + "last_name".
// =============================================================================

export function presentUsers(payload) {
  const users = payload?.data?.users ?? [];
  const total = Number(payload?.data?.pagination?.total_entries);
  return {
    users: users.map((user) => ({
      id: String(user.user_id ?? user.id ?? ""),
      nome: text(user.name) || [text(user.first_name), text(user.last_name)].filter(Boolean).join(" ") || "-",
      email: text(user.email),
      departamento: text(user.department ?? user.sector) || "Sem departamento"
    })),
    total: Number.isFinite(total) ? total : users.length
  };
}

function text(value) {
  return String(value ?? "").trim();
}
