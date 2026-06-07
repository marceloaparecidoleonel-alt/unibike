/* ═══════════════════════════════════════════════════════════════
   UNIBIKE Admin — editar-produto.js
   Carrega produto por ID, salva alterações (updateDoc) e excluí
   (deleteDoc) diretamente no Firestore.
   ═══════════════════════════════════════════════════════════════ */

import { db } from "./firebase.js";
import {
    doc, getDoc, updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { uploadImage } from "./cloudinary.js";

const params    = new URLSearchParams(window.location.search);
const produtoId = params.get('id');

/* ── Estado das imagens ───────────────────────────────────────── */
let imagensExistentes = [];
let arquivosNovos = [];

function renderStripEditar() {
    const strip = document.getElementById('imagesPreviewStrip');
    if (!strip) return;
    strip.innerHTML = '';
    imagensExistentes.forEach((url, i) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;width:58px;height:58px;border-radius:6px;overflow:hidden;border:1px solid var(--adm-border);flex-shrink:0;';
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        const btn = document.createElement('button');
        btn.type = 'button'; btn.textContent = '×'; btn.title = 'Remover';
        btn.style.cssText = 'position:absolute;top:2px;right:2px;background:rgba(0,0,0,.65);color:#fff;border:none;cursor:pointer;width:16px;height:16px;font-size:13px;line-height:1;border-radius:3px;padding:0;';
        btn.addEventListener('click', () => { imagensExistentes.splice(i, 1); renderStripEditar(); });
        wrap.append(img, btn); strip.appendChild(wrap);
    });
    arquivosNovos.forEach((file, i) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;width:58px;height:58px;border-radius:6px;overflow:hidden;border:1px solid var(--adm-red);flex-shrink:0;';
        const img = document.createElement('img');
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        const reader = new FileReader();
        reader.onload = ev => { img.src = ev.target.result; };
        reader.readAsDataURL(file);
        const btn = document.createElement('button');
        btn.type = 'button'; btn.textContent = '×'; btn.title = 'Remover';
        btn.style.cssText = 'position:absolute;top:2px;right:2px;background:rgba(0,0,0,.65);color:#fff;border:none;cursor:pointer;width:16px;height:16px;font-size:13px;line-height:1;border-radius:3px;padding:0;';
        btn.addEventListener('click', () => { arquivosNovos.splice(i, 1); renderStripEditar(); });
        wrap.append(img, btn); strip.appendChild(wrap);
    });
}

/* ── Preenche o formulário com os dados do Firestore ─────────── */
function preencherForm(p) {
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val ?? '';
    };

    set('prodNome',      p.nome);
    set('prodMarca',     p.marca);
    set('prodModelo',    p.modelo);
    set('prodCategoria', p.categoria);
    set('prodCondicao',  p.condicao);
    set('prodPreco',     p.preco || '');
    set('prodDescricao', p.descricao);
    set('prodAro',       p.aro);
    set('prodMarchas',   p.marchas);
    set('prodFreio',     p.freio);
    set('prodQuadro',    p.quadro);
    set('prodSuspensao', p.suspensao);
    set('prodTags',      (p.tags || []).join(', '));

    /* Toggles */
    const tog = (id, val) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (val) el.classList.add('is-on'); else el.classList.remove('is-on');
    };
    tog('prodAtivo',      p.ativo      ?? true);
    tog('prodDestaque',   p.destaque   ?? false);
    tog('prodDisponivel', p.disponivel ?? true);

    /* Preview de imagem existente + strip de todas as imagens */
    const primeiraImg = (p.imagens && p.imagens.length) ? p.imagens[0] : p.imagem;
    if (primeiraImg) {
        const prev = document.getElementById('imagePreview');
        if (prev) prev.innerHTML = `<img src="${primeiraImg}" alt="Imagem atual" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
    }
    imagensExistentes = Array.isArray(p.imagens) && p.imagens.length ? [...p.imagens] : (p.imagem ? [p.imagem] : []);
    renderStripEditar();

    /* ID no breadcrumb e no indicador */
    const bc = document.querySelector('.adm-breadcrumb span:last-child');
    if (bc) bc.textContent = p.nome || produtoId;

    const idEl = document.getElementById('produtoIdDisplay');
    if (idEl) idEl.textContent = produtoId;

    /* Nome no modal de exclusão */
    const modalStrong = document.querySelector('#deleteModal p strong');
    if (modalStrong) modalStrong.textContent = p.nome || produtoId;

    document.title = `Editar: ${p.nome || 'Produto'} — UNIBIKE Admin`;
}

/* ── Lê o formulário e retorna o objeto de dados ─────────────── */
function lerForm() {
    const g = id => document.getElementById(id);
    const tog = id => g(id)?.classList.contains('is-on') ?? false;

    return {
        nome:       g('prodNome')?.value?.trim()      || '',
        marca:      g('prodMarca')?.value?.trim()     || '',
        modelo:     g('prodModelo')?.value?.trim()    || '',
        categoria:  g('prodCategoria')?.value         || '',
        condicao:   g('prodCondicao')?.value          || '',
        preco:      (() => { const v = g('prodPreco')?.value; return v ? parseFloat(v) : null; })(),
        descricao:  g('prodDescricao')?.value?.trim() || '',
        aro:        g('prodAro')?.value?.trim()       || '',
        marchas:    g('prodMarchas')?.value?.trim()   || '',
        freio:      g('prodFreio')?.value?.trim()     || '',
        quadro:     g('prodQuadro')?.value?.trim()    || '',
        suspensao:  g('prodSuspensao')?.value?.trim() || '',
        tags:       (g('prodTags')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
        ativo:      tog('prodAtivo'),
        destaque:   tog('prodDestaque'),
        disponivel: tog('prodDisponivel'),
        atualizadoEm: serverTimestamp()
    };
}

/* ── Inicialização ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

    if (!produtoId) {
        showToast('ID do produto não informado na URL.', 'error');
        return;
    }

    /* Carrega o produto */
    try {
        const snap = await getDoc(doc(db, 'produtos', produtoId));
        if (!snap.exists()) {
            showToast('Produto não encontrado.', 'error');
            return;
        }
        preencherForm(snap.data());
    } catch (e) {
        console.error('[Editar] Carregar:', e);
        showToast('Erro ao carregar produto.', 'error');
        return;
    }

    /* File input: acumula novos arquivos */
    const _fiEditar = document.getElementById('productImage');
    if (_fiEditar) {
        _fiEditar.addEventListener('change', () => {
            Array.from(_fiEditar.files).forEach(f => {
                if (imagensExistentes.length + arquivosNovos.length >= 8) return;
                if (!arquivosNovos.find(x => x.name === f.name && x.size === f.size)) arquivosNovos.push(f);
            });
            renderStripEditar();
        });
    }

    /* Salvar — todos os botões [data-save] */
    document.querySelectorAll('[data-save]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const dados = lerForm();
            if (!dados.nome) { showToast('Nome é obrigatório.', 'error'); return; }

            const orig = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = 'Salvando...';

            try {
                /* Upload das novas imagens */
                const novasURLs = [];
                for (const arq of arquivosNovos) {
                    novasURLs.push(await uploadImage(arq));
                }
                const imagensFinal = [...imagensExistentes, ...novasURLs].slice(0, 8);
                dados.imagem  = imagensFinal[0] || null;
                dados.imagens = imagensFinal;
                /* Atualiza preview principal */
                if (imagensFinal[0]) {
                    const prev = document.getElementById('imagePreview');
                    if (prev) prev.innerHTML = `<img src="${imagensFinal[0]}" alt="Imagem" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
                }

                await updateDoc(doc(db, 'produtos', produtoId), dados);
                showToast('Produto atualizado com sucesso!', 'success');
                arquivosNovos = [];
                renderStripEditar();
            } catch (e) {
                console.error('[Editar] Salvar:', e);
                showToast(`Erro ao salvar: ${e.message}`, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = orig;
            }
        });
    });

    /* Excluir — substitui o handler estático do admin.js */
    const oldConfirm = document.getElementById('confirmDeleteBtn');
    if (oldConfirm) {
        const newConfirm = oldConfirm.cloneNode(true);
        oldConfirm.parentNode?.replaceChild(newConfirm, oldConfirm);
        newConfirm.addEventListener('click', async () => {
            try {
                await deleteDoc(doc(db, 'produtos', produtoId));
                showToast('Produto excluído com sucesso!', 'success');
                setTimeout(() => { window.location.href = 'produtos.html'; }, 1200);
            } catch (e) {
                console.error('[Editar] Excluir:', e);
                showToast(`Erro ao excluir: ${e.message}`, 'error');
            }
        });
    }
});
