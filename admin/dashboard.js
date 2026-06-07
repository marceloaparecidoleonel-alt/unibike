import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CAT_LABEL  = { mtb:'Mountain Bike', urbana:'Urbana/Speed', infantil:'Infantil', eletrica:'Elétrica', pecas:'Peças', acessorios:'Acessórios', skates:'Skates' };
const CAT_KEYS   = ['mtb','urbana','infantil','eletrica','pecas','acessorios','skates'];
const CAT_COLORS = ['#E53935','#F57C00','#FDD835','#43A047','#1E88E5','#8E24AA','#00897B'];

function toDate(ts) {
    if (!ts) return null;
    if (typeof ts.toDate === 'function') return ts.toDate();
    if (ts instanceof Date) return ts;
    return new Date(ts);
}

function tempoRelativo(ts) {
    const d = toDate(ts);
    if (!d) return 'data desconhecida';
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'agora mesmo';
    if (m < 60) return `há ${m} minuto${m > 1 ? 's' : ''}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `há ${h} hora${h > 1 ? 's' : ''}`;
    const di = Math.floor(h / 24);
    if (di === 1) return 'ontem';
    if (di < 30)  return `há ${di} dias`;
    return `há ${Math.floor(di / 30)} meses`;
}

function setStat(n, value, label, change) {
    const card = document.getElementById(`dashStat${n}`);
    if (!card) return;
    card.querySelector('.adm-stat-value').textContent = value;
    card.querySelector('.adm-stat-label').textContent = label;
    let ch = card.querySelector('.adm-stat-change');
    if (!ch && change) { ch = document.createElement('div'); ch.className = 'adm-stat-change'; card.appendChild(ch); }
    if (ch) ch.textContent = change || '';
}

function renderCharts(produtos) {
    if (typeof Chart === 'undefined') return;
    const st = getComputedStyle(document.documentElement);
    const textMuted = st.getPropertyValue('--adm-text-muted').trim() || '#888';
    const border    = st.getPropertyValue('--adm-border').trim()     || '#333';

    const nonEmpty = CAT_KEYS
        .map((c, i) => ({ label: CAT_LABEL[c], count: produtos.filter(p => p.categoria === c).length, color: CAT_COLORS[i] }))
        .filter(x => x.count > 0);

    const ctxBar = document.getElementById('chartCategoria');
    if (ctxBar) {
        Chart.getChart(ctxBar)?.destroy();
    }
    if (ctxBar) new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: nonEmpty.map(x => x.label),
            datasets: [{ label: 'Produtos', data: nonEmpty.map(x => x.count),
                backgroundColor: nonEmpty.map(x => x.color + 'BB'),
                borderColor: nonEmpty.map(x => x.color), borderWidth: 1, borderRadius: 6 }]
        },
        options: { responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, color: textMuted, font: { size: 11 } }, grid: { color: border } },
                x: { ticks: { color: textMuted, font: { size: 11 } }, grid: { display: false } }
            }
        }
    });

    const ctxPie = document.getElementById('chartDistribuicao');
    if (ctxPie) {
        Chart.getChart(ctxPie)?.destroy();
    }
    if (ctxPie) new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: nonEmpty.map(x => x.label),
            datasets: [{ data: nonEmpty.map(x => x.count),
                backgroundColor: nonEmpty.map(x => x.color + 'BB'),
                borderColor: nonEmpty.map(x => x.color), borderWidth: 1 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%',
            plugins: { legend: { position: 'bottom',
                labels: { color: textMuted, padding: 12, font: { size: 11 }, boxWidth: 12 } } }
        }
    });
}

function renderActivity(produtos) {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;
    const eventos = [];
    produtos.forEach(p => {
        const criado = toDate(p.criadoEm), atualizado = toDate(p.atualizadoEm);
        if (atualizado && criado && atualizado > criado) eventos.push({ nome: p.nome, tipo: 'edit', ts: atualizado });
        else if (criado) eventos.push({ nome: p.nome, tipo: 'add', ts: criado });
    });
    eventos.sort((a, b) => b.ts - a.ts);
    const recentes = eventos.slice(0, 6);
    if (!recentes.length) {
        feed.innerHTML = `<div class="adm-activity-item"><div class="adm-activity-dot adm-activity-dot--add"></div><div><div class="adm-activity-text" style="color:var(--adm-text-muted);">Nenhuma atividade recente.</div></div></div>`;
        return;
    }
    feed.innerHTML = recentes.map(e => {
        const dot  = e.tipo === 'add' ? 'adm-activity-dot--add' : 'adm-activity-dot--edit';
        const acao = e.tipo === 'add' ? 'foi cadastrado' : 'foi atualizado';
        return `<div class="adm-activity-item">
            <div class="adm-activity-dot ${dot}"></div>
            <div><div class="adm-activity-text"><strong>${e.nome || 'Produto sem nome'}</strong> ${acao}</div>
            <div class="adm-activity-meta">${tempoRelativo(e.ts)}</div></div>
        </div>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    const badge = document.getElementById('dashBadge');
    try {
        const snap    = await getDocs(collection(db, 'produtos'));
        const produtos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        const total    = produtos.length;
        const ativos   = produtos.filter(p => p.ativo).length;
        const inativos = produtos.filter(p => !p.ativo).length;
        const destaque = produtos.filter(p => p.destaque).length;
        const indisp   = produtos.filter(p => !p.disponivel).length;

        setStat(0, total,    'Total de Produtos', `${ativos} ativo${ativos !== 1 ? 's' : ''} · ${destaque} em destaque`);
        setStat(1, ativos,   'Produtos Ativos',   inativos > 0 ? `${inativos} inativo${inativos !== 1 ? 's' : ''}` : 'Todos ativos');
        setStat(2, inativos, 'Produtos Inativos',  inativos > 0 ? 'Verificar catálogo' : 'Nenhum inativo');
        setStat(3, destaque, 'Em Destaque',        'Exibidos na página inicial');
        setStat(4, indisp,   'Indisponíveis',      indisp > 0 ? 'Fora de estoque' : 'Todos em estoque');

        if (badge) badge.textContent = `Atualizado agora · ${total} produto${total !== 1 ? 's' : ''}`;

        renderActivity(produtos);
        renderCharts(produtos);
    } catch (e) {
        console.error('[Dashboard]', e);
        if (badge) badge.textContent = 'Erro ao carregar dados';
        if (typeof showToast === 'function') showToast('Erro ao carregar dados do dashboard.', 'error');
    }
});
