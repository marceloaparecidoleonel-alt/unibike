/* ═══════════════════════════════════════════════════════════════
   UNIBIKE Admin Panel — auth.js
   Autenticação Firebase: login, logout e proteção de rotas.
   ─────────────────────────────────────────────────────────────
   Este arquivo deve ser incluído em TODAS as páginas admin
   protegidas com:
     <script type="module" src="auth.js"></script>
   ═══════════════════════════════════════════════════════════════ */

// ── Importações Firebase ──────────────────────────────────────
// Os imports DEVEM vir antes de qualquer código executável em módulos ES.
import { auth, db } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Constantes ────────────────────────────────────────────────
const LOGIN_PAGE    = "login.html";
const REDIRECT_PAGE = "dashboard.html";

// ── Tempo máximo (ms) para o Firebase resolver onAuthStateChanged ──
// Evita que a página fique invisível para sempre em caso de falha de rede.
const AUTH_TIMEOUT_MS = 8000;

// ══════════════════════════════════════════════════════════════
//  VERIFICAÇÃO DE PAPEL (role) NO FIRESTORE
//  Consulta a coleção "usuarios" pelo UID do Firebase Auth.
//  Retorna true apenas se role === "admin".
//  Se o documento não existir, permite o acesso (modo legado).
// ══════════════════════════════════════════════════════════════
async function verificarAdmin(usuario) {
    try {
        const ref  = doc(db, "usuarios", usuario.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            // Documento ainda não criado no Firestore → acesso permitido (modo legado)
            console.warn(
                `[UNIBIKE Auth] Documento "usuarios/${usuario.uid}" não encontrado no Firestore. ` +
                `Acesso concedido em modo legado. Crie o documento com campo role="admin" para ativar controle por perfil.`
            );
            return true;
        }

        const dados = snap.data();
        const isAdmin = dados.role === "admin";

        if (!isAdmin) {
            console.warn(
                `[UNIBIKE Auth] Usuário ${usuario.email} autenticado, mas role="${dados.role ?? 'indefinido'}". ` +
                `Acesso negado. Esperado: role="admin".`
            );
        } else {
            console.info(`[UNIBIKE Auth] Acesso admin confirmado para ${usuario.email} (UID: ${usuario.uid})`);
        }

        return isAdmin;
    } catch (erro) {
        // Erro de rede ou regras Firestore → permite acesso para não bloquear o admin
        console.error("[UNIBIKE Auth] Erro ao verificar role no Firestore:", erro.message);
        console.warn("[UNIBIKE Auth] Acesso permitido por fallback (erro Firestore).");
        return true;
    }
}

// ══════════════════════════════════════════════════════════════
//  PROTEÇÃO DE ROTAS
//  Verifica sessão ativa ao carregar qualquer página protegida.
//  Se o usuário não estiver autenticado ou não for admin,
//  redireciona para login.html.
// ══════════════════════════════════════════════════════════════
export function protegerRota() {
    console.info("[UNIBIKE Auth] protegerRota() iniciado — verificando sessão...");

    // Oculta o conteúdo enquanto verifica sessão (evita flash de conteúdo)
    document.documentElement.style.visibility = "hidden";

    // ── Timeout de segurança ──
    // Se o Firebase não resolver dentro de AUTH_TIMEOUT_MS, exibe a página
    // e redireciona para login. Evita tela em branco permanente.
    const timeoutId = setTimeout(() => {
        console.error(
            `[UNIBIKE Auth] Timeout (${AUTH_TIMEOUT_MS}ms): Firebase Auth não respondeu. ` +
            `Verifique conexão de rede e as credenciais em firebase.js.`
        );
        document.documentElement.style.visibility = "";
        window.location.replace(LOGIN_PAGE);
    }, AUTH_TIMEOUT_MS);

    // ── onAuthStateChanged: escuta mudanças de estado de autenticação ──
    // Dispara imediatamente ao carregar com a sessão atual (ou null se não logado).
    onAuthStateChanged(auth, async (usuario) => {
        clearTimeout(timeoutId); // Firebase respondeu → cancela o timeout

        if (!usuario) {
            // Sem sessão ativa → redireciona para login
            console.info("[UNIBIKE Auth] Nenhuma sessão ativa. Redirecionando para login.");
            document.documentElement.style.visibility = "";
            window.location.replace(LOGIN_PAGE);
            return;
        }

        console.info(`[UNIBIKE Auth] Sessão ativa: ${usuario.email} (UID: ${usuario.uid})`);

        // ── Verificar se o usuário tem papel de administrador no Firestore ──
        const ehAdmin = await verificarAdmin(usuario);

        if (!ehAdmin) {
            // Autenticado, mas sem papel admin → logout e redireciona
            console.warn("[UNIBIKE Auth] Usuário sem permissão admin. Encerrando sessão.");
            await signOut(auth);
            document.documentElement.style.visibility = "";
            window.location.replace(LOGIN_PAGE);
            return;
        }

        // Sessão válida e papel confirmado → exibe a página
        document.documentElement.style.visibility = "";
        preencherInfoUsuario(usuario);
    });
}

// ══════════════════════════════════════════════════════════════
//  LOGIN
//  Chamado pelo formulário em login.html.
//  Usa signInWithEmailAndPassword do Firebase Authentication.
// ══════════════════════════════════════════════════════════════
export async function fazerLogin(email, senha) {
    console.info(`[UNIBIKE Auth] Tentativa de login para: ${email}`);
    try {
        // ── Autenticação real via Firebase Auth ──
        const credencial = await signInWithEmailAndPassword(auth, email, senha);
        console.info(`[UNIBIKE Auth] Login Firebase OK — UID: ${credencial.user.uid}`);

        // ── Verificar papel no Firestore antes de redirecionar ──
        const ehAdmin = await verificarAdmin(credencial.user);
        if (!ehAdmin) {
            await signOut(auth);
            console.warn("[UNIBIKE Auth] Login recusado: usuário sem role=admin no Firestore.");
            return "Sua conta não tem permissão de administrador.";
        }

        // Login bem-sucedido → redireciona para o dashboard
        console.info("[UNIBIKE Auth] Redirecionando para dashboard...");
        window.location.replace(REDIRECT_PAGE);
    } catch (erro) {
        // Log detalhado para facilitar diagnóstico
        console.error(`[UNIBIKE Auth] Erro no login — código: ${erro.code} | mensagem: ${erro.message}`);
        // Retorna mensagem amigável conforme o código de erro Firebase
        return traduzirErroAuth(erro.code);
    }
    return null;
}

// ══════════════════════════════════════════════════════════════
//  LOGOUT
//  Encerra a sessão do usuário e redireciona para login.
// ══════════════════════════════════════════════════════════════
export async function fazerLogout() {
    console.info(`[UNIBIKE Auth] Logout solicitado para: ${auth.currentUser?.email ?? "desconhecido"}`);
    try {
        // ── signOut Firebase Auth ──
        await signOut(auth);
        console.info("[UNIBIKE Auth] Logout concluído. Redirecionando para login.");
        window.location.replace(LOGIN_PAGE);
    } catch (erro) {
        console.error("[UNIBIKE Auth] Erro ao fazer logout:", erro.message);
    }
}

// ── Preencher nome/email do usuário na UI do painel ──────────
function preencherInfoUsuario(usuario) {
    const nomeEl   = document.getElementById("admUserName");
    const emailEl  = document.getElementById("admUserEmail");
    const avatarEl = document.getElementById("admUserAvatar");

    const nomeExibido = usuario.displayName || usuario.email.split("@")[0];
    const iniciais    = nomeExibido.slice(0, 2).toUpperCase();

    if (nomeEl)   nomeEl.textContent   = nomeExibido;
    if (emailEl)  emailEl.textContent  = usuario.email;
    if (avatarEl) avatarEl.textContent = iniciais;
}

// ── Tradução de erros Firebase Auth para português ───────────
function traduzirErroAuth(code) {
    const mensagens = {
        "auth/invalid-credential":        "E-mail ou senha inválidos.",
        "auth/user-not-found":            "Usuário não encontrado.",
        "auth/wrong-password":            "Senha incorreta.",
        "auth/invalid-email":             "Endereço de e-mail inválido.",
        "auth/user-disabled":             "Conta desativada. Contate o suporte.",
        "auth/too-many-requests":         "Muitas tentativas. Aguarde e tente novamente.",
        "auth/network-request-failed":    "Erro de conexão. Verifique sua internet.",
        "auth/email-already-in-use":      "Este e-mail já está em uso.",
        "auth/operation-not-allowed":     "Método de login não habilitado no Firebase Console.",
        "auth/weak-password":             "Senha muito fraca.",
        "auth/requires-recent-login":     "Por segurança, faça login novamente antes de continuar.",
        "auth/account-exists-with-different-credential":
                                          "Já existe uma conta com este e-mail usando outro método de login.",
    };
    return mensagens[code] || `Erro ao realizar login. Tente novamente. (${code})`;
}

// ── Configura botão de logout (id="admLogoutBtn") ────────────
// Nota: em módulos ES, o script já executa após o DOM estar disponível,
// portanto DOMContentLoaded é desnecessário — usamos seleção direta.
const btnLogout = document.getElementById("admLogoutBtn");
if (btnLogout) {
    btnLogout.addEventListener("click", fazerLogout);
}
