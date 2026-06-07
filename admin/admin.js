/* ═══════════════════════════════════════════════
   UNIBIKE Admin Panel — admin.js
   Front-end only. Preparado para integração futura.
   ═══════════════════════════════════════════════ */
'use strict';

/* ── Prevent flash: inline no <head> de cada página ─ */
(function () {
    const t = localStorage.getItem('unibike-theme') || 'dark';
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
})();

document.addEventListener('DOMContentLoaded', () => {

    /* ── Theme toggle ────────────────────────── */
    const themeBtn = document.getElementById('adminThemeBtn');
    if (themeBtn) {
        const html = document.documentElement;
        const sun  = themeBtn.querySelector('.icon-sun');
        const moon = themeBtn.querySelector('.icon-moon');
        const syncIcons = () => {
            const isLight = html.getAttribute('data-theme') === 'light';
            if (sun)  sun.style.display  = isLight ? 'none'  : '';
            if (moon) moon.style.display = isLight ? ''      : 'none';
        };
        syncIcons();
        themeBtn.addEventListener('click', () => {
            const isLight = html.getAttribute('data-theme') === 'light';
            if (isLight) {
                html.removeAttribute('data-theme');
                localStorage.setItem('unibike-theme', 'dark');
            } else {
                html.setAttribute('data-theme', 'light');
                localStorage.setItem('unibike-theme', 'light');
            }
            syncIcons();
        });
    }

    /* ── Sidebar toggle (mobile) ─────────────── */
    const menuBtn  = document.getElementById('adminMenuBtn');
    const sidebar  = document.querySelector('.adm-sidebar');
    const overlay  = document.querySelector('.adm-sidebar-overlay');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('is-open');
            if (overlay) overlay.classList.toggle('is-visible');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('is-open');
            overlay.classList.remove('is-visible');
        });
    }

    /* ── Toggles ─────────────────────────────── */
    document.querySelectorAll('.adm-toggle').forEach(el => {
        el.addEventListener('click', () => el.classList.toggle('is-on'));
    });

    /* ── Delete modal ────────────────────────── */
    const deleteModal = document.getElementById('deleteModal');
    document.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => deleteModal?.classList.add('is-open'));
    });
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.adm-modal-overlay').forEach(m => m.classList.remove('is-open'));
        });
    });
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
        deleteModal?.classList.remove('is-open');
        showToast('Produto removido com sucesso.', 'success');
    });

    /* ── Image preview ───────────────────────── */
    const fileInput = document.getElementById('productImage');
    const imgPreview = document.getElementById('imagePreview');
    if (fileInput && imgPreview) {
        fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                imgPreview.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        });
    }

    /* ── Form actions ────────────────────────── */
    // [data-save] agora é tratado por produtos.js para salvamento real no Firestore
    document.querySelectorAll('[data-settings-save]').forEach(btn => {
        btn.addEventListener('click', () => showToast('Configurações salvas!', 'success'));
    });
    document.querySelectorAll('[data-cat-add]').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = document.getElementById('catModal');
            if (m) m.classList.add('is-open');
        });
    });
    document.querySelectorAll('[data-cat-edit]').forEach(btn => {
        btn.addEventListener('click', () => showToast('Funcionalidade disponível após integração com backend.', 'info'));
    });
    document.querySelectorAll('[data-cat-delete]').forEach(btn => {
        btn.addEventListener('click', () => showToast('Categoria não pode ser excluída (produtos vinculados).', 'error'));
    });

    /* ── Settings tabs ───────────────────────── */
    document.querySelectorAll('.adm-settings-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.adm-settings-nav-item').forEach(i => i.classList.remove('is-active'));
            item.classList.add('is-active');
            const target = item.dataset.panel;
            document.querySelectorAll('.adm-settings-panel').forEach(p => p.classList.remove('is-active'));
            document.getElementById(target)?.classList.add('is-active');
        });
    });

    /* ── Skeleton loading ────────────────────── */
    document.querySelectorAll('.adm-skeleton-row').forEach(row => {
        setTimeout(() => {
            row.style.opacity = '0';
            row.style.transition = '.3s';
            setTimeout(() => row.remove(), 300);
        }, 900 + Math.random() * 400);
    });

    /* ── Charts ──────────────────────────────── */
    initCharts();
});

/* ── Toast system ────────────────────────────── */
function showToast(message, type = 'info') {
    const icons = {
        success: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 10l4 4 8-8"/></svg>`,
        error:   `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 5l10 10M15 5 5 15"/></svg>`,
        info:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 7v4M10 13v.5"/></svg>`
    };
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'adm-toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `adm-toast adm-toast--${type}`;
    toast.innerHTML = `<span class="adm-toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(16px)';
        toast.style.transition = '.25s ease';
        setTimeout(() => toast.remove(), 260);
    }, 3500);
}

/* ── Charts ──────────────────────────────────── */
/* Gráficos criados pelo dashboard.js com dados reais do Firestore. */
function initCharts() {}

window.showToast = showToast;
