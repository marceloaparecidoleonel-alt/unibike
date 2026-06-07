/* ═══════════════════════════════════════════════════════════════
   UNIBIKE Admin Panel — produtos.js
   Salvamento de produtos no Firestore.
   ─────────────────────────────────────────────────────────────
   Este arquivo deve ser incluído em páginas de cadastro/edição
   de produtos com:
     <script type="module" src="produtos.js"></script>
   ═══════════════════════════════════════════════════════════════ */

// ── Importações Firebase ──────────────────────────────────────
import { db, colecoes } from "./firebase.js";
import {
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Importação Cloudinary ───────────────────────────────────────
import { uploadImage } from "./cloudinary.js";

// ══════════════════════════════════════════════════════════════
//  SALVAR PRODUTO NO FIRESTORE
//  Chamado ao clicar em botões com data-save.
// ══════════════════════════════════════════════════════════════
/* ── Múltiplas imagens ─────────────────────────────────────── */
let arquivosSelecionados = [];

function atualizarStrip() {
    const strip = document.getElementById('imagesPreviewStrip');
    if (!strip) return;
    strip.innerHTML = '';
    arquivosSelecionados.forEach((file, i) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;width:58px;height:58px;border-radius:6px;overflow:hidden;border:1px solid var(--adm-border);flex-shrink:0;';
        const img = document.createElement('img');
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        const reader = new FileReader();
        reader.onload = ev => { img.src = ev.target.result; };
        reader.readAsDataURL(file);
        const remBtn = document.createElement('button');
        remBtn.type = 'button';
        remBtn.textContent = '×';
        remBtn.title = 'Remover';
        remBtn.style.cssText = 'position:absolute;top:2px;right:2px;background:rgba(0,0,0,.65);color:#fff;border:none;cursor:pointer;width:16px;height:16px;font-size:13px;line-height:1;border-radius:3px;padding:0;';
        remBtn.addEventListener('click', () => { arquivosSelecionados.splice(i, 1); atualizarStrip(); });
        wrap.append(img, remBtn);
        strip.appendChild(wrap);
    });
}

const _fi = document.getElementById('productImage');
if (_fi) {
    _fi.addEventListener('change', () => {
        Array.from(_fi.files).forEach(f => {
            if (arquivosSelecionados.length >= 8) return;
            if (!arquivosSelecionados.find(x => x.name === f.name && x.size === f.size)) arquivosSelecionados.push(f);
        });
        atualizarStrip();
    });
}

document.querySelectorAll('[data-save]').forEach(btn => {
    btn.addEventListener('click', async () => {
        console.info('[UNIBIKE Produtos] Iniciando salvamento...');

        // ── Capturar valores dos campos ───────────────────────────
        const nome      = document.getElementById('prodNome')?.value?.trim() || '';
        const marca     = document.getElementById('prodMarca')?.value?.trim() || '';
        const modelo    = document.getElementById('prodModelo')?.value?.trim() || '';
        const categoria = document.getElementById('prodCategoria')?.value || '';
        const condicao  = document.getElementById('prodCondicao')?.value || '';
        const precoRaw  = document.getElementById('prodPreco')?.value;
        const descricao = document.getElementById('prodDescricao')?.value?.trim() || '';
        const aro       = document.getElementById('prodAro')?.value?.trim() || '';
        const marchas   = document.getElementById('prodMarchas')?.value?.trim() || '';
        const freio     = document.getElementById('prodFreio')?.value?.trim() || '';
        const quadro    = document.getElementById('prodQuadro')?.value?.trim() || '';
        const suspensao = document.getElementById('prodSuspensao')?.value?.trim() || '';
        const tagsRaw   = document.getElementById('prodTags')?.value?.trim() || '';

        // ── Capturar estado dos toggles ───────────────────────────
        const ativoEl     = document.getElementById('prodAtivo');
        const destaqueEl  = document.getElementById('prodDestaque');
        const disponivelEl = document.getElementById('prodDisponivel');

        const ativo      = ativoEl?.classList.contains('is-on') ?? true;
        const destaque   = destaqueEl?.classList.contains('is-on') ?? false;
        const disponivel = disponivelEl?.classList.contains('is-on') ?? true;

        // ── Converter tags para array (split por vírgula) ───────────
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];

        // ── Converter preço para number (null se vazio) ────────────
        const preco = precoRaw && precoRaw !== '' ? parseFloat(precoRaw) : null;

        // ── Validação de campos obrigatórios ───────────────────────
        if (!nome) {
            console.error('[UNIBIKE Produtos] Erro: campo "Nome do Produto" é obrigatório.');
            showToast('O campo "Nome do Produto" é obrigatório.', 'error');
            return;
        }
        if (!categoria) {
            console.error('[UNIBIKE Produtos] Erro: campo "Categoria" é obrigatório.');
            showToast('Selecione uma categoria.', 'error');
            return;
        }
        if (!condicao) {
            console.error('[UNIBIKE Produtos] Erro: campo "Condição" é obrigatório.');
            showToast('Selecione a condição do produto.', 'error');
            return;
        }

        // ── Upload das imagens para Cloudinary ───────────────────────────
        const imagensURLs = [];
        if (arquivosSelecionados.length > 0) {
            try {
                for (const arq of arquivosSelecionados) {
                    const url = await uploadImage(arq);
                    imagensURLs.push(url);
                }
            } catch (uploadError) {
                console.error('[UNIBIKE Produtos] Erro no upload das imagens:', uploadError);
                showToast('Erro ao fazer upload das imagens. Produto não foi salvo.', 'error');
                return;
            }
        }

        // ── Montar objeto do documento Firestore ───────────────────
        const produto = {
            nome,
            marca,
            modelo,
            categoria,
            condicao,
            preco,
            descricao,
            aro,
            marchas,
            freio,
            quadro,
            suspensao,
            tags,
            ativo,
            destaque,
            disponivel,
            imagem:  imagensURLs[0] || null,
            imagens: imagensURLs,
            criadoEm:    serverTimestamp(),
            atualizadoEm: serverTimestamp()
        };

        // ── Desabilitar botão durante salvamento ─────────────────
        const btnOriginalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Salvando...';

        try {
            // ── Salvar no Firestore ───────────────────────────────
            const docRef = await addDoc(colecoes.produtos, produto);
            console.info(`[UNIBIKE Produtos] Produto salvo com sucesso. ID: ${docRef.id}`);
            showToast('Produto salvo com sucesso!', 'success');

            // ── Limpar formulário ─────────────────────────────────
            limparFormulario();

        } catch (erro) {
            // ── Erro ao salvar ────────────────────────────────────
            console.error('[UNIBIKE Produtos] Erro ao salvar produto:', erro);
            console.error('[UNIBIKE Produtos] Código do erro:', erro.code);
            console.error('[UNIBIKE Produtos] Mensagem do erro:', erro.message);
            showToast(`Erro ao salvar: ${erro.message}`, 'error');
        } finally {
            // ── Reabilitar botão ───────────────────────────────────
            btn.disabled = false;
            btn.innerHTML = btnOriginalText;
        }
    });
});

// ── Limpar todos os campos do formulário ────────────────────────
function limparFormulario() {
    const campos = [
        'prodNome', 'prodMarca', 'prodModelo', 'prodCategoria', 'prodCondicao',
        'prodPreco', 'prodDescricao', 'prodAro', 'prodMarchas', 'prodFreio',
        'prodQuadro', 'prodSuspensao', 'prodTags'
    ];

    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Limpar input de arquivo
    const fileInput = document.getElementById('productImage');
    if (fileInput) fileInput.value = '';

    // Resetar toggles para estado padrão
    const ativoEl      = document.getElementById('prodAtivo');
    const destaqueEl   = document.getElementById('prodDestaque');
    const disponivelEl = document.getElementById('prodDisponivel');

    if (ativoEl)      ativoEl.classList.add('is-on');
    if (destaqueEl)   destaqueEl.classList.remove('is-on');
    if (disponivelEl) disponivelEl.classList.add('is-on');

    // Limpar preview de imagem
    const imgPreview = document.getElementById('imagePreview');
    if (imgPreview) {
        imgPreview.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
            </svg>
        `;
    }

    arquivosSelecionados = [];
    atualizarStrip();
    console.info('[UNIBIKE Produtos] Formulário limpo.');
}
