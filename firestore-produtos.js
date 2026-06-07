/* ═══════════════════════════════════════════════════════════════
   UNIBIKE — firestore-produtos.js
   Carrega produtos do Firestore e atualiza o catálogo público.
   Normaliza os campos do admin (PT) para o schema do site (EN).
   ═══════════════════════════════════════════════════════════════ */

import { db } from "./admin/firebase.js";
import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function normalizarProduto(doc) {
    const d = doc.data();
    return {
        id:          doc.id,
        name:        d.nome        || '',
        brand:       d.marca       || '',
        model:       d.modelo      || '',
        category:    d.categoria   || '',
        condition:   d.condicao    || '',
        price:       d.preco       ?? null,
        description: d.descricao   || '',
        images:      Array.isArray(d.imagens) && d.imagens.length ? d.imagens : (d.imagem ? [d.imagem] : []),
        specs: {
            aro:       d.aro       || '',
            marchas:   d.marchas   || '',
            freio:     d.freio     || '',
            quadro:    d.quadro    || '',
            suspensao: d.suspensao || ''
        },
        tags:        d.tags        || [],
        featured:    d.destaque    ?? false,
        available:   d.disponivel  ?? true
    };
}

async function carregarProdutos() {
    try {
        console.info('[UNIBIKE] Carregando produtos do Firestore...');

        const q = query(
            collection(db, "produtos"),
            where("ativo", "==", true)
        );

        const snapshot = await getDocs(q);

        const produtos = snapshot.docs
            .map(normalizarProduto)
            .filter(p => p.available);

        console.info(`[UNIBIKE] ${produtos.length} produto(s) carregado(s).`);

        window.UNIBIKE = window.UNIBIKE || {};
        window.UNIBIKE.products = produtos;

        // ── Home (index.html) ─────────────────────────────────────
        if (typeof window.initHome === 'function') {
            window.initHome();
        }

        // ── Catálogo (catalogo.html) ──────────────────────────────
        if (typeof window.UNIBIKE._catalogRefresh === 'function') {
            window.UNIBIKE._catalogRefresh(produtos);
        }

        // ── Página de produto (produto.html) ──────────────────────
        if (typeof window.initProductPage === 'function') {
            window.initProductPage();
        }

    } catch (err) {
        console.error('[UNIBIKE] Erro ao carregar produtos do Firestore:', err);
    }
}

carregarProdutos();
