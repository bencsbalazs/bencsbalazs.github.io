import { currentLanguage } from '../../../assets/js/helpers.js';

const state = { data: null };
const tbody = document.getElementById('tbody');
const groupSel = document.getElementById('group');
const categorySel = document.getElementById('category');
const search = document.getElementById('search');
const countEl = document.getElementById('count');
const playAllBtn = document.getElementById('playAll');
const stopBtn = document.getElementById('stop');

const lang = currentLanguage();

async function loadData() {
    const res = await fetch('./sv_words.json');
    if (!res.ok) throw new Error('Don\'t find the dictionary.');
    state.data = await res.json();
    fillSelectors();
    render();
}

function fillSelectors() {
    groupSel.innerHTML = '';
    state.data.groups.forEach((group, index) => {
        const opt = document.createElement('option');
        opt.value = group.id;
        opt.textContent = `${group.name[lang]}`;
        if (index === 0) opt.selected = true;
        groupSel.appendChild(opt);
    });
    fillCategorySelector();
}

function currentGroup() {
    const gid = groupSel.value;
    return state.data.groups.find(g => g.id === gid) || state.data.groups[0];
}
function currentCategory() {
    const g = currentGroup();
    const cid = categorySel.value;
    return g.categories.find(c => c.id === cid) || g.categories[0];
}

function fillCategorySelector() {
    const g = currentGroup();
    categorySel.innerHTML = '';
    g.categories.forEach((c, i) => {
        const count = c.items.length;
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name[lang]} (${count})`;
        if (i === 0) opt.selected = true;
        categorySel.appendChild(opt);
    });
}

function render() {
    const cat = currentCategory();
    const q = (search.value || '').toLowerCase().trim();
    const rows = cat.items.filter(({ sv, pronHu, hu, en, ipa }) => {
        const hay = `${sv} ${pronHu} ${hu} ${en} ${ipa || ''}`.toLowerCase();
        return q ? hay.includes(q) : true;
    });
    tbody.innerHTML = '';
    rows.forEach(({ sv, pronHu, hu, en, ipa }) => {
        const tr = document.createElement('tr');
        const tdSv = document.createElement('td');
        tdSv.textContent = sv;
        const tdPron = document.createElement('td');
        tdPron.textContent = pronHu || '';
        const tdIpa = document.createElement('td');
        tdIpa.className = 'ipa';
        tdIpa.textContent = ipa || '';
        const tdHu = document.createElement('td');
        tdHu.textContent = hu || '';
        const tdEn = document.createElement('td');
        tdEn.textContent = en || '';
        const tdBtn = document.createElement('td');
        const btn = document.createElement('button');
        btn.className = 'icon';
        btn.setAttribute('aria-label', 'Reading');
        btn.textContent = '🔊';
        btn.addEventListener('click', () => speak(sv));
        tdBtn.appendChild(btn);
        tr.append(tdSv, tdPron, tdIpa, tdHu, tdEn, tdBtn);
        tbody.appendChild(tr);
    });
    countEl.textContent = `${rows.length} expression`;
}

let svVoice = null;
const loadVoicesChromeSafe = () => {
    return new Promise(resolve => {
        const tryLoad = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices?.length) {
                svVoice =
                    voices.find(v => v?.lang.toLowerCase().startsWith('sv')) ||
                    voices.find(v => /swedish|svenska/i.test(v.name || '')) ||
                    null;
                resolve(voices);
                return true;
            }
            return false;
        };
        if (!tryLoad()) {
            window.speechSynthesis.onvoiceschanged = () => {
                tryLoad();
            };
            const id = setInterval(() => {
                if (tryLoad()) {
                    clearInterval(id);
                }
            }, 300);
        }
    });
};

const speak = text => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'sv-SE';
    if (svVoice) u.voice = svVoice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
};

playAllBtn.addEventListener('click', () => {
    const cat = currentCategory();
    const q = (search.value || '').toLowerCase().trim();
    const items = cat.items
        .filter(({ sv, pronHu, hu, en, ipa }) => {
            const hay = `${sv} ${pronHu} ${hu} ${en} ${ipa || ''}`.toLowerCase();
            return q ? hay.includes(q) : true;
        })
        .map(({ sv }) => sv);
    if (!items.length) return;
    (function playSeq(list) {
        if (!list.length) return;
        const u = new SpeechSynthesisUtterance(list[0]);
        u.lang = 'sv-SE';
        if (svVoice) u.voice = svVoice;
        u.onend = () => playSeq(list.slice(1));
        window.speechSynthesis.speak(u);
    })(items);
});

stopBtn.addEventListener('click', () => {
    window.speechSynthesis.cancel();
});

groupSel.addEventListener('change', () => {
    fillCategorySelector();
    render();
});
categorySel.addEventListener('change', render);
search.addEventListener('input', render);
document.querySelectorAll('.flag').forEach(flag => {
    flag.addEventListener('click', e => {
        e.target.style.opacity = e.target.style.opacity === '0.5' ? '1' : '0.5';
        let colNumber = e.target.getAttribute('data-colnumber');
        document
            .querySelectorAll('table tr td:nth-child(' + colNumber + '), table tr th:nth-child(' + colNumber + ')')
            .forEach(col => {
                col.style.display = col.style.display === 'none' ? 'table-cell' : 'none';
            });
    });
});

loadVoicesChromeSafe().then(loadData);
