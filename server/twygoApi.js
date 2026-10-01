// =============================================================================
// Conversa com a API da Twygo (somente LEITURA de usuários).
//
// - O token fica no arquivo .env (TWYGO_API_TOKEN) e é usado SÓ aqui no servidor.
// - O token NUNCA é devolvido para o navegador nem impresso no terminal.
// - fetchAllUsers busca TODAS as páginas (100 por página) e junta tudo.
// - Privacidade (LGPD): o navegador recebe SÓ os campos que as telas usam
//   (user_id, name, email, department). Telefone, endereço, CEP, documentos etc.
//   ficam de fora. Precisa de outro campo? Adicione em pickUserFields com cuidado.
// =============================================================================

export const DEFAULT_BASE_URL = "https://api.twygo.com";
const PER_PAGE = 100;
const MAX_PAGES = 50; // trava de segurança: no máximo 5.000 usuários

const MISSING_TOKEN_MESSAGE =
  "O token da Twygo ainda não foi configurado. Peça ao Claude: \"Crie o .env a partir do .env.example e abra o arquivo para eu colar o token\". Cole o token no arquivo (nunca no chat), salve e diga \"pronto\".";

/** Fica só com os campos que as telas usam. Nada de telefone, endereço, CEP ou documentos. */
export function pickUserFields(user) {
  const name = text(user?.name) || [text(user?.first_name), text(user?.last_name)].filter(Boolean).join(" ");
  return {
    user_id: user?.user_id ?? user?.id ?? null,
    name,
    email: text(user?.email),
    department: text(user?.department ?? user?.sector)
  };
}

function text(value) {
  return value === null || value === undefined || typeof value === "object" ? "" : String(value).trim();
}

/** Troca a lista de usuários da resposta pela versão enxuta, mantendo a paginação. */
function slimBody(body) {
  if (!Array.isArray(body?.data?.users)) return body;
  return { message: body.message ?? "", data: { users: body.data.users.map(pickUserFields), pagination: body.data.pagination ?? {} } };
}

/** Diz se existe um token de verdade (e não o texto de exemplo). */
export function isTokenConfigured(token) {
  const text = String(token ?? "").trim();
  return text.length > 0 && !text.startsWith("cole_o_");
}

/** Busca UMA página de usuários. Devolve { status, body } (nunca lança erro de HTTP). */
export async function fetchUsersPage({ page = 1, perPage = PER_PAGE, token, baseUrl = DEFAULT_BASE_URL, fetcher = fetch }) {
  if (!isTokenConfigured(token)) {
    return { status: 503, body: { message: MISSING_TOKEN_MESSAGE, code: "TOKEN_MISSING" } };
  }

  const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const response = await fetcher(`${baseUrl}/api/v2/users?${query.toString()}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` }
  });

  if (response.status === 401 || response.status === 403) {
    return {
      status: 401,
      body: { message: "A Twygo recusou o token: ele está inválido ou vencido. Peça um token novo ao João ou à Adriana.", code: "TOKEN_INVALID" }
    };
  }

  const body = await readJson(response);
  return { status: response.status, body: response.status >= 200 && response.status < 300 ? slimBody(body) : body };
}

/** Busca TODAS as páginas e devolve { status, body: { data: { users, pagination } } }. */
export async function fetchAllUsers({ token, baseUrl = DEFAULT_BASE_URL, fetcher = fetch }) {
  const users = [];
  let lastBody = {};

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await fetchUsersPage({ page, token, baseUrl, fetcher });
    if (result.status < 200 || result.status >= 300) return result;

    lastBody = result.body ?? {};
    const pageUsers = lastBody?.data?.users ?? [];
    users.push(...pageUsers);

    const totalPages = Number(lastBody?.data?.pagination?.total_pages);
    const reachedEnd = Number.isFinite(totalPages) && totalPages > 0 ? page >= totalPages : pageUsers.length < PER_PAGE;
    if (reachedEnd || pageUsers.length === 0) break;
  }

  const totalEntries = Number(lastBody?.data?.pagination?.total_entries);
  return {
    status: 200,
    body: {
      message: lastBody?.message ?? "",
      data: {
        users,
        pagination: {
          total_entries: Number.isFinite(totalEntries) ? totalEntries : users.length,
          total_pages: Number(lastBody?.data?.pagination?.total_pages) || undefined
        }
      }
    }
  };
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return { message: "A API da Twygo respondeu algo que não é JSON." };
  }
}
