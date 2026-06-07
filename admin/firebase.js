/* ═══════════════════════════════════════════════════════════════
   UNIBIKE — firebase.js
   Arquivo central de configuração do Firebase para o painel admin.
   ─────────────────────────────────────────────────────────────
   COMO OBTER AS CREDENCIAIS:
     1. Acesse console.firebase.google.com
     2. Selecione o projeto da UNIBIKE
     3. Engrenagem → Configurações do projeto → Seus aplicativos
     4. Copie o objeto firebaseConfig e substitua abaixo
   ═══════════════════════════════════════════════════════════════ */

// ── Importações do Firebase via CDN ESM (compatível com GitHub Pages) ──
// Os imports DEVEM vir antes de qualquer código executável em módulos ES.
// Módulos ES já são strict por padrão — 'use strict' é desnecessário.
import { initializeApp }             from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth }                   from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage }                from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ── Configuração do projeto Firebase ─────────────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyBNMwUOXA5tnPKgzCrXNq9OAZXsQ_QEpNU",
    authDomain:        "unibike-867ba.firebaseapp.com",
    projectId:         "unibike-867ba",
    storageBucket:     "unibike-867ba.firebasestorage.app",
    messagingSenderId: "772436820530",
    appId:             "1:772436820530:web:049c6f576a135cc63db22b",
    measurementId:     "G-C80B58NWBP"
};

// ── Inicializar app Firebase ──────────────────────────────────
const app  = initializeApp(firebaseConfig);

// ── Inicializar Firebase Authentication ──────────────────────
const auth = getAuth(app);

// ── Inicializar Cloud Firestore ───────────────────────────────
const db = getFirestore(app);

// ── Inicializar Firebase Storage ───────────────────────────────
const storage = getStorage(app);

// ── Referências às coleções do Firestore ─────────────────────
// Adicione consultas específicas nos arquivos de cada funcionalidade.
const colecoes = {
    usuarios:       collection(db, "usuarios"),       // Usuários cadastrados
    produtos:       collection(db, "produtos"),       // Catálogo de produtos
    clientes:       collection(db, "clientes"),       // Clientes da loja
    ordensServico:  collection(db, "ordensServico"),  // Ordens de serviço da oficina
};

// ── Exportações ───────────────────────────────────────────────
export { app, auth, db, storage, colecoes };
