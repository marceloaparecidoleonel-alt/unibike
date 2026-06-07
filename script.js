/*
 * UNIBIKE — script.js
 * Arquitetura modular por página. Cada módulo verifica a existência
 * dos elementos antes de inicializar — sem crashes entre páginas.
 *
 * Módulos:
 *  1. Utils     — constantes, helpers
 *  2. Theme     — toggle claro/escuro
 *  3. UI        — header scroll, menu, ripple, smooth scroll
 *  4. Store     — cards, busca, filtros, paginação
 *  5. Home      — destaques (index.html)
 *  6. Catalog   — catálogo com filtros (catalogo.html)
 *  7. Product   — página de produto (produto.html)
 *  8. Init      — detecta página, chama módulos
 */

/* ─── 1. UTILS ─────────────────────────────────────────────────── */

const WA_NUMBER = "554396152886";
const WA_URL    = `https://wa.me/${WA_NUMBER}`;
const ITEMS_PER_PAGE = 12;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─── 2. THEME ──────────────────────────────────────────────────── */

function setupThemeToggle() {
    const toggles = document.querySelectorAll(".theme-toggle");
    if (!toggles.length) return;

    function applyTheme(theme) {
        if (theme === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
        localStorage.setItem("unibike-theme", theme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", theme === "dark" ? "#121212" : "#FFFFFF");
        toggles.forEach((btn) => {
            const label = theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro";
            btn.setAttribute("aria-label", label);
            btn.setAttribute("title", label);
        });
    }

    toggles.forEach((btn) => {
        btn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
            applyTheme(current === "dark" ? "light" : "dark");
        });
    });
}

/* ─── 3. UI ─────────────────────────────────────────────────────── */

function setupHeader() {
    const header = document.getElementById("siteHeader");
    if (!header) return;
    function update() {
        header.classList.toggle("scrolled", window.scrollY > 20);
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
}

function setupMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav    = document.getElementById("storeNav");
    if (!toggle) return;

    function close() {
        toggle.classList.remove("is-active");
        if (nav) nav.classList.remove("is-open");
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menu");
    }

    toggle.addEventListener("click", () => {
        const open = nav ? nav.classList.toggle("is-open") : false;
        toggle.classList.toggle("is-active", open);
        document.body.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && nav && nav.classList.contains("is-open")) close();
    });
}

function setupButtonRipples() {
    document.querySelectorAll(".btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const rect = btn.getBoundingClientRect();
            const d = Math.max(rect.width, rect.height);
            const r = d / 2;
            const ripple = document.createElement("span");
            ripple.className = "btn-ripple";
            ripple.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - rect.left - r}px;top:${e.clientY - rect.top - r}px`;
            btn.querySelector(".btn-ripple")?.remove();
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (e) => {
            const id = link.getAttribute("href");
            if (id === "#") { e.preventDefault(); return; }
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        });
    });
}

function setupFooterYear() {
    const el = document.getElementById("currentYear");
    if (el) el.textContent = new Date().getFullYear();
}

function setupLoader() {
    const loader = document.querySelector(".page-loader");
    if (!loader) return;
    window.addEventListener("load", () => {
        setTimeout(() => loader.classList.add("is-hidden"), 450);
    });
}

function setupHeaderSearch() {
    const form  = document.getElementById("storeSearchForm");
    const input = document.getElementById("storeSearchInput");
    if (!form || !input) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = input.value.trim();
        if (q) {
            window.location.href = `catalogo.html?q=${encodeURIComponent(q)}`;
        } else {
            window.location.href = "catalogo.html";
        }
    });
}

function highlightActiveNavLink() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    document.querySelectorAll(".store-nav-link").forEach((link) => {
        const linkCat = link.dataset.cat;
        const active = cat ? linkCat === cat : linkCat === "todas";
        link.classList.toggle("is-active", active);
    });
}

/* ─── 4. STORE (shared card rendering) ─────────────────────────── */

const CONDITION_LABEL = { nova: "Nova", seminova: "Seminova", usada: "Usada", servico: "Serviço" };
const CONDITION_BADGE = { nova: "badge-nova", seminova: "badge-seminova", usada: "badge-usada", servico: "badge-consulte" };
const CATEGORY_LABEL  = {
    mtb: "Mountain Bike", urbana: "Urbana", infantil: "Infantil",
    eletrica: "Elétrica", pecas: "Peças", acessorios: "Acessórios", skates: "Skates"
};

function productPlaceholderSvg(id) {
    return `<svg viewBox="0 0 280 200" role="img" aria-label="Imagem do produto">
        <rect width="280" height="200" rx="0"/>
        <circle cx="80" cy="148" r="32" fill="none" stroke="#FFD700" stroke-width="5"/>
        <circle cx="200" cy="148" r="32" fill="none" stroke="#FFD700" stroke-width="5"/>
        <path d="M80 148h48l28-56h28l-20 56h28M128 148 94 92h36" fill="none" stroke="#FFD700" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="80" cy="148" r="9" fill="#FFD700"/>
        <circle cx="200" cy="148" r="9" fill="#FFD700"/>
    </svg>`;
}

function formatPrice(price) {
    if (price === null || price === undefined) return '<span class="price-consult">Consultar</span>';
    return `<span class="price-tag">R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>`;
}

function buildProductCard(product) {
    const catLabel  = CATEGORY_LABEL[product.category] || product.category;
    const condLabel = CONDITION_LABEL[product.condition] || product.condition;
    const condBadge = CONDITION_BADGE[product.condition] || "badge-consulte";
    const imgHtml   = product.images && product.images[0]
        ? `<img src="${product.images[0]}" alt="${product.name}" loading="lazy">`
        : productPlaceholderSvg(product.id);
    const waMsg = encodeURIComponent(`Olá, UNIBIKE! Vi o produto "${product.name}" no catálogo e gostaria de mais informações.`);

    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("role", "listitem");
    card.innerHTML = `
        <a class="product-card-image" href="produto.html?id=${product.id}" aria-label="Ver ${product.name}">
            <div class="product-card-badges">
                <span class="badge badge-category">${catLabel}</span>
                <span class="badge ${condBadge}">${condLabel}</span>
            </div>
            ${imgHtml}
        </a>
        <div class="product-card-body">
            <h3 class="product-card-title">
                <a href="produto.html?id=${product.id}">${product.name}</a>
            </h3>
            <p class="product-card-desc">${product.description}</p>
            <div class="product-card-price">${formatPrice(product.price)}</div>
            <div class="product-card-actions">
                <a class="btn btn-primary btn-sm" href="produto.html?id=${product.id}">Ver produto</a>
                <a class="btn btn-whatsapp btn-sm" href="${WA_URL}?text=${waMsg}" target="_blank" rel="noopener">WhatsApp</a>
            </div>
        </div>`;
    return card;
}

function renderProductGrid(gridEl, products) {
    gridEl.innerHTML = "";
    if (!products.length) {
        gridEl.innerHTML = `<div class="catalog-empty"><strong>Nenhum produto encontrado</strong><span>Tente outros filtros ou termos de busca.</span></div>`;
        return;
    }
    products.forEach((p) => gridEl.appendChild(buildProductCard(p)));
}

/* ─── 5. HOME (index.html) ──────────────────────────────────────── */

function initHome() {
    const featuredGrid = document.getElementById("featuredGrid");
    if (!featuredGrid) return;

    const products = (window.UNIBIKE && window.UNIBIKE.products) || [];
    if (!products.length) {
        featuredGrid.innerHTML = '<div class="catalog-empty"><span>Carregando produtos...</span></div>';
        return;
    }
    const featured = products.filter((p) => p.featured && p.available).slice(0, 8);
    renderProductGrid(featuredGrid, featured);
}

/* ─── 6. CATALOG (catalogo.html) ────────────────────────────────── */

function initCatalog() {
    const grid        = document.getElementById("catalogGrid");
    const pagination  = document.getElementById("catalogPagination");
    const resultsInfo = document.getElementById("catalogResultsInfo");
    const breadcrumb  = document.getElementById("breadcrumbCurrent");
    const clearBtn    = document.getElementById("clearFilters");
    const searchInput = document.getElementById("storeSearchInput");
    const searchForm  = document.getElementById("storeSearchForm");
    if (!grid) return;

    let products = (window.UNIBIKE && window.UNIBIKE.products) || [];
    const params   = new URLSearchParams(window.location.search);
    let activeCat  = params.get("cat") || "todas";
    let activeCond = params.get("cond") || "todas";
    let searchTerm = params.get("q") || "";
    let currentPage = 1;

    if (searchInput && searchTerm) searchInput.value = searchTerm;

    function getFiltered() {
        return products.filter((p) => {
            const matchCat  = activeCat === "todas" || p.category === activeCat;
            const matchCond = activeCond === "todas" || p.condition === activeCond;
            const term = searchTerm.toLowerCase().trim();
            const matchSearch = !term ||
                p.name.toLowerCase().includes(term) ||
                (p.description || "").toLowerCase().includes(term) ||
                (CATEGORY_LABEL[p.category] || "").toLowerCase().includes(term) ||
                (p.tags || []).some((t) => t.toLowerCase().includes(term));
            return matchCat && matchCond && matchSearch;
        });
    }

    function updateCounts() {
        Object.keys(CATEGORY_LABEL).forEach((cat) => {
            const el = document.getElementById(`count-cat-${cat}`);
            if (el) el.textContent = products.filter((p) => p.category === cat).length;
        });
        const el = document.getElementById("count-cat-todas");
        if (el) el.textContent = products.length;
        ["nova", "seminova", "usada"].forEach((cond) => {
            const el2 = document.getElementById(`count-cond-${cond}`);
            if (el2) el2.textContent = products.filter((p) => p.condition === cond).length;
        });
    }

    function updateBreadcrumb() {
        if (!breadcrumb) return;
        if (activeCat !== "todas") {
            breadcrumb.textContent = CATEGORY_LABEL[activeCat] || activeCat;
        } else if (searchTerm) {
            breadcrumb.textContent = `Busca: "${searchTerm}"`;
        } else {
            breadcrumb.textContent = "Catálogo";
        }
    }

    function renderPagination(total, totalPages) {
        if (!pagination) return;
        pagination.innerHTML = "";
        if (totalPages <= 1) return;
        const prev = document.createElement("button");
        prev.className = "catalog-pagination-btn";
        prev.textContent = "‹";
        prev.disabled = currentPage === 1;
        prev.addEventListener("click", () => { currentPage--; refresh(); });
        pagination.appendChild(prev);
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.className = `catalog-pagination-btn${i === currentPage ? " is-active" : ""}`;
            btn.textContent = i;
            btn.addEventListener("click", () => { currentPage = i; refresh(); });
            pagination.appendChild(btn);
        }
        const next = document.createElement("button");
        next.className = "catalog-pagination-btn";
        next.textContent = "›";
        next.disabled = currentPage === totalPages;
        next.addEventListener("click", () => { currentPage++; refresh(); });
        pagination.appendChild(next);
    }

    function refresh() {
        const filtered  = getFiltered();
        const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
        currentPage = Math.min(currentPage, totalPages);
        const slice = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
        renderProductGrid(grid, slice);
        renderPagination(filtered.length, totalPages);
        updateBreadcrumb();
        if (resultsInfo) {
            const w = filtered.length === 1 ? "produto" : "produtos";
            resultsInfo.textContent = `${filtered.length} ${w} encontrados`;
        }
        document.querySelectorAll("[data-filter-cat]").forEach((btn) => {
            btn.classList.toggle("is-active", btn.dataset.filterCat === activeCat);
        });
        document.querySelectorAll("[data-filter-cond]").forEach((btn) => {
            btn.classList.toggle("is-active", btn.dataset.filterCond === activeCond);
        });
    }

    if (products.length) {
        updateCounts();
        refresh();
    } else {
        grid.innerHTML = '<div class="catalog-empty"><span>Carregando produtos...</span></div>';
    }

    window.UNIBIKE = window.UNIBIKE || {};
    window.UNIBIKE._catalogRefresh = (newProducts) => {
        products = newProducts;
        currentPage = 1;
        updateCounts();
        refresh();
    };

    document.querySelectorAll("[data-filter-cat]").forEach((btn) => {
        btn.addEventListener("click", () => {
            activeCat = btn.dataset.filterCat;
            currentPage = 1;
            refresh();
            closeSidebar();
        });
    });

    document.querySelectorAll("[data-filter-cond]").forEach((btn) => {
        btn.addEventListener("click", () => {
            activeCond = btn.dataset.filterCond;
            currentPage = 1;
            refresh();
            closeSidebar();
        });
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            activeCat = "todas"; activeCond = "todas"; searchTerm = "";
            currentPage = 1;
            if (searchInput) searchInput.value = "";
            refresh();
        });
    }

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", (e) => { e.preventDefault(); });
        searchInput.addEventListener("input", () => {
            searchTerm = searchInput.value;
            currentPage = 1;
            refresh();
        });
    }

    const sidebar      = document.getElementById("catalogSidebar");
    const sidebarToggle = document.querySelector(".catalog-filter-toggle");
    const sidebarClose = document.querySelector(".catalog-sidebar-close");

    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove("is-open");
        document.body.classList.remove("sidebar-open");
        if (sidebarToggle) sidebarToggle.setAttribute("aria-expanded", "false");
    }

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener("click", () => {
            const open = sidebar.classList.toggle("is-open");
            document.body.classList.toggle("sidebar-open", open);
            sidebarToggle.setAttribute("aria-expanded", String(open));
        });
    }
    if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
}

/* ─── 7. PRODUCT PAGE (produto.html) ────────────────────────────── */

function initProductPage() {
    const contentEl   = document.getElementById("productContent");
    const relatedGrid = document.getElementById("relatedGrid");
    const nameEl      = document.getElementById("productBreadcrumbName");
    if (!contentEl) return;

    const products = (window.UNIBIKE && window.UNIBIKE.products) || [];
    const params   = new URLSearchParams(window.location.search);
    const id       = params.get("id");
    const product  = products.find((p) => p.id === id);

    if (!product) {
        if (!products.length) {
            contentEl.innerHTML = '<div class="product-not-found"><p>Carregando produto...</p></div>';
            return;
        }
        contentEl.innerHTML = `<div class="product-not-found">
            <h2>Produto não encontrado</h2>
            <p>O produto que você procura pode não estar mais disponível.</p>
            <a class="btn btn-primary" href="catalogo.html">Ver catálogo</a>
        </div>`;
        return;
    }

    document.title = `${product.name} | UNIBIKE`;
    if (nameEl) nameEl.textContent = product.name;

    const catLabel  = CATEGORY_LABEL[product.category] || product.category;
    const condLabel = CONDITION_LABEL[product.condition] || product.condition;
    const condBadge = CONDITION_BADGE[product.condition] || "badge-consulte";
    const imgHtml   = product.images && product.images[0]
        ? `<img src="${product.images[0]}" alt="${product.name}">`
        : `<div class="product-page-placeholder">${productPlaceholderSvg(product.id)}</div>`;

    let specsHtml = "";
    if (product.specs && Object.keys(product.specs).length) {
        const rows = Object.entries(product.specs).map(([k, v]) =>
            `<tr><th>${k.charAt(0).toUpperCase() + k.slice(1)}</th><td>${v}</td></tr>`
        ).join("");
        specsHtml = `<div class="product-specs"><h3>Especificações</h3><table class="specs-table">${rows}</table></div>`;
    }

    const waMsg = encodeURIComponent(`Olá, UNIBIKE! Vi o produto "${product.name}" no catálogo (ID: ${product.id}) e gostaria de mais informações.`);

    contentEl.innerHTML = `
        <div class="product-page-grid">
            <div class="product-page-gallery">
                ${imgHtml}
                ${product.images && product.images.length > 1
                    ? `<div class="product-gallery-thumbs">${product.images.map((src, i) =>
                        `<img src="${src}" alt="${product.name} foto ${i + 1}" class="gallery-thumb${i === 0 ? " is-active" : ""}" data-idx="${i}">`
                    ).join("")}</div>`
                    : ""}
            </div>
            <div class="product-page-info">
                <div class="product-page-badges">
                    <span class="badge badge-category">${catLabel}</span>
                    <span class="badge ${condBadge}">${condLabel}</span>
                </div>
                <h1 class="product-page-title">${product.name}</h1>
                ${product.brand !== "UNIBIKE" ? `<p class="product-page-brand">${product.brand}</p>` : ""}
                <div class="product-page-price">${formatPrice(product.price)}</div>
                <p class="product-page-desc">${product.description}</p>
                <div class="product-page-cta">
                    <a class="btn btn-whatsapp btn-lg" href="${WA_URL}?text=${waMsg}" target="_blank" rel="noopener">
                        Consultar pelo WhatsApp
                    </a>
                    <a class="btn btn-outline" href="catalogo.html">Ver catálogo</a>
                </div>
                ${specsHtml}
            </div>
        </div>`;

    /* Galeria: clique em miniatura troca a imagem principal */
    if (product.images && product.images.length > 1) {
        const mainImg = contentEl.querySelector('.product-page-gallery img');
        contentEl.querySelectorAll('.gallery-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const idx = parseInt(thumb.dataset.idx, 10);
                if (mainImg && product.images[idx]) mainImg.src = product.images[idx];
                contentEl.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('is-active'));
                thumb.classList.add('is-active');
            });
        });
    }

    if (relatedGrid) {
        const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
        renderProductGrid(relatedGrid, related);
        const relSec = document.getElementById("relatedSection");
        if (relSec && !related.length) relSec.style.display = "none";
    }
}

/* ─── 8. INIT ────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
    setupThemeToggle();
    setupHeader();
    setupMenu();
    setupButtonRipples();
    setupSmoothScroll();
    setupFooterYear();
    setupLoader();
    setupHeaderSearch();
    highlightActiveNavLink();

    initHome();
    initCatalog();
    initProductPage();
});
