/* ═══════════════════════════════════════════════════════════════
   UNIBIKE Admin — lista-produtos.js
   CRUD da listagem de produtos: carregar, ativar/desativar,
   destacar e excluir diretamente do Firestore.
   ═══════════════════════════════════════════════════════════════ */

import { db } from "./firebase.js";
import {
    collection, getDocs, deleteDoc, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CAT = {
    mtb: 'MTB', urbana: 'Urbana', infantil: 'Infantil',
    eletrica: 'Elétrica', pecas: 'Peças', acessorios: 'Acessórios', skates: 'Skates'
};
const COND_LABEL = { nova: 'Nova', seminova: 'Seminova', usada: 'Usada' };
const COND_BADGE = { nova: 'adm-badge--nova', seminova: 'adm-badge--seminova', usada: 'adm-badge--usada' };

let todos = [];
let paraExcluir = null;

/* ── Renderização de uma linha ───────────────────────────────── */
function buildRow(p) {
    const tr = document.createElement('tr');
    tr.dataset.id = p.id;

    const img = p.imagem
        ? `<img src="${p.imagem}" style="width:38px;height:38px;object-fit:cover;border-radius:6px;flex-shrink:0;">`
        : `<div class="adm-table-thumb"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5.5" cy="14.5" r="3"/><circle cx="14.5" cy="14.5" r="3"/><path d="M5.5 14.5h4l2-5h2l1 5M11 9.5 9.5 6H7"/></svg></div>`;

    const preco = p.preco
        ? `R$\u00a0${Number(p.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : 'Consultar';

    const marca = [p.marca, p.modelo].filter(Boolean).join(' · ');

    tr.innerHTML = `
        <td>
            <div class="adm-product-cell">
                ${img}
                <div>
                    <div class="adm-product-name">${p.nome || '—'}</div>
                    <div class="adm-product-brand">${marca}</div>
                </div>
            </div>
        </td>
        <td><span class="adm-badge adm-badge--cat">${CAT[p.categoria] || p.categoria || '—'}</span></td>
        <td><span class="adm-badge ${COND_BADGE[p.condicao] || ''}">${COND_LABEL[p.condicao] || p.condicao || '—'}</span></td>
        <td style="font-weight:600;color:var(--adm-red);">${preco}</td>
        <td>
            <span class="adm-badge ${p.ativo ? 'adm-badge--ativo' : 'adm-badge--inativo'}"
                  data-toggle-ativo style="cursor:pointer;"
                  title="${p.ativo ? 'Clique para desativar' : 'Clique para ativar'}">
                ${p.ativo ? 'Ativo' : 'Inativo'}
            </span>
        </td>
        <td>
            <div class="adm-actions">
                <a href="editar-produto.html?id=${p.id}" class="adm-action-btn" title="Editar">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 16l1-4L14 3a2 2 0 0 1 3 3L8 15l-4 1Z"/></svg>
                </a>
                <button class="adm-action-btn" data-toggle-destaque
                        title="${p.destaque ? 'Remover destaque' : 'Colocar em destaque'}"
                        style="${p.destaque ? 'color:var(--adm-red)' : ''}">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 2l2.4 4.9H18l-4.4 3.2 1.7 5.2L10 12.3l-5.3 3 1.7-5.2L2 7h5.6L10 2Z"/></svg>
                </button>
                <a href="../produto.html?id=${p.id}" class="adm-action-btn" target="_blank" title="Ver no site">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 4H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/><path d="M13 3h4v4M10 10l7-7"/></svg>
                </a>
                <button class="adm-action-btn adm-action-btn--danger" data-del title="Excluir">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h14M8 6V4h4v2M6 6l1 11h6l1-11"/></svg>
                </button>
            </div>
        </td>`;

    /* Toggle ativo */
    tr.querySelector('[data-toggle-ativo]').addEventListener('click', async () => {
        const novo = !p.ativo;
        try {
            await updateDoc(doc(db, 'produtos', p.id), { ativo: novo });
            p.ativo = novo;
            const badge = tr.querySelector('[data-toggle-ativo]');
            badge.className = `adm-badge ${novo ? 'adm-badge--ativo' : 'adm-badge--inativo'}`;
            badge.setAttribute('data-toggle-ativo', '');
            badge.style.cursor = 'pointer';
            badge.title = novo ? 'Clique para desativar' : 'Clique para ativar';
            badge.textContent = novo ? 'Ativo' : 'Inativo';
            showToast(`Produto ${novo ? 'ativado' : 'desativado'}.`, 'success');
        } catch (e) {
            console.error('[Produtos] Toggle ativo:', e);
            showToast('Erro ao atualizar produto.', 'error');
        }
    });

    /* Toggle destaque */
    tr.querySelector('[data-toggle-destaque]').addEventListener('click', async () => {
        const novo = !p.destaque;
        try {
            await updateDoc(doc(db, 'produtos', p.id), { destaque: novo });
            p.destaque = novo;
            const btn = tr.querySelector('[data-toggle-destaque]');
            btn.style.color = novo ? 'var(--adm-red)' : '';
            btn.title = novo ? 'Remover destaque' : 'Colocar em destaque';
            showToast(`Destaque ${novo ? 'ativado' : 'removido'}.`, 'success');
        } catch (e) {
            console.error('[Produtos] Toggle destaque:', e);
            showToast('Erro ao atualizar produto.', 'error');
        }
    });

    /* Abrir modal de exclusão */
    tr.querySelector('[data-del]').addEventListener('click', () => {
        paraExcluir = p;
        const modal = document.getElementById('deleteModal');
        const strong = modal?.querySelector('p strong');
        if (strong) strong.textContent = p.nome || p.id;
        modal?.classList.add('is-open');
    });

    return tr;
}

/* ── Renderiza a tabela com a lista filtrada ─────────────────── */
function renderTabela(lista) {
    const tbody = document.querySelector('.adm-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--adm-text-muted);">Nenhum produto encontrado.</td></tr>`;
    } else {
        lista.forEach(p => tbody.appendChild(buildRow(p)));
    }
    const info = document.querySelector('.adm-pagination > span');
    if (info) info.textContent = `${lista.length} produto${lista.length !== 1 ? 's' : ''} no total`;
}

/* ── Aplica filtros locais ───────────────────────────────────── */
function filtrar() {
    const termo  = (document.querySelector('.adm-search-input')?.value || '').toLowerCase();
    const cat    = document.getElementById('filterCat')?.value    || '';
    const cond   = document.getElementById('filterCond')?.value   || '';
    const status = document.getElementById('filterStatus')?.value || '';

    const lista = todos.filter(p => {
        const matchTermo  = !termo  || (p.nome||'').toLowerCase().includes(termo) || (p.marca||'').toLowerCase().includes(termo);
        const matchCat    = !cat    || p.categoria === cat;
        const matchCond   = !cond   || p.condicao  === cond;
        const matchStatus = !status || (status === 'ativo' ? p.ativo : !p.ativo);
        return matchTermo && matchCat && matchCond && matchStatus;
    });
    renderTabela(lista);
}

/* ── Inicialização ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

    /* Substituir o handler estático do admin.js no confirmDeleteBtn */
    const oldConfirm = document.getElementById('confirmDeleteBtn');
    if (oldConfirm) {
        const newConfirm = oldConfirm.cloneNode(true);
        oldConfirm.parentNode?.replaceChild(newConfirm, oldConfirm);
        newConfirm.addEventListener('click', async () => {
            if (!paraExcluir) return;
            try {
                await deleteDoc(doc(db, 'produtos', paraExcluir.id));
                todos = todos.filter(p => p.id !== paraExcluir.id);
                filtrar();
                document.getElementById('deleteModal')?.classList.remove('is-open');
                showToast('Produto excluído com sucesso.', 'success');
                paraExcluir = null;
            } catch (e) {
                console.error('[Produtos] Excluir:', e);
                showToast('Erro ao excluir produto.', 'error');
            }
        });
    }

    /* Pré-selecionar filtro de categoria a partir do parâmetro ?cat= da URL */
    const catParam = new URLSearchParams(window.location.search).get('cat');
    if (catParam) {
        const el = document.getElementById('filterCat');
        if (el) el.value = catParam;
    }

    /* Filtros e pesquisa */
    document.querySelector('.adm-search-input')?.addEventListener('input', filtrar);
    document.getElementById('filterCat')?.addEventListener('change', filtrar);
    document.getElementById('filterCond')?.addEventListener('change', filtrar);
    document.getElementById('filterStatus')?.addEventListener('change', filtrar);

    /* Carregar produtos do Firestore */
    try {
        const snap = await getDocs(collection(db, 'produtos'));
        todos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        filtrar();
    } catch (e) {
        console.error('[Produtos] Carregar:', e);
        showToast('Erro ao carregar produtos.', 'error');
        document.querySelector('.adm-table tbody').innerHTML =
            `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--adm-text-muted);">Erro ao carregar. Verifique a conexão.</td></tr>`;
    }
});
