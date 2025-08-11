// --- БЛОК КОНВЕРТАЦИИ ЧИСЛА В ПРОПИСЬ (проверенная версия) ---
function numberToWordsRu(number) { const _n=Number(String(number).replace(/\s/g,''));if(isNaN(_n)|| _n===0)return'ноль'; const h=['','сто','двести','триста','четыреста','пятьсот','шестьсот','семьсот','восемьсот','девятьсот'],t=['','десять','двадцать','тридцать','сорок','пятьдесят','шестьдесят','семьдесят','восемьдесят','девяносто'],o=['','один','два','три','четыре','пять','шесть','семь','восемь','девять'],e=['десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцать'],r=[['тысяча','тысячи','тысяч',1],['миллион','миллиона','миллионов',0],['миллиард','миллиарда','миллиардов',0]];function p(n,l){if(n===0)return'';let s=n%10,a=Math.floor(n/10)%10,d=Math.floor(n/100)%10,c='';if(d>0)c+=h[d]+' ';if(a===1)c+=e[s]+' ';else{c+=t[a]+' ';let g=l>0?r[l-1][3]:0;c+=(g===1&&(s===1||s===2))?(s===1?'одна ':'две '):o[s]+' '}if(l>0){if(s===1&&a!==1)c+=r[l-1][0];else if(s>1&&s<5&&a!==1)c+=r[l-1][1];else c+=r[l-1][2]}return c}let i=[],l=0,n=_n;while(n>0){i.push(p(n%1000,l));n=Math.floor(n/1000);l++}return i.reverse().join(' ').replace(/\s+/g,' ').trim()}

// --- УТИЛИТЫ И НАСТРОЙКИ UI ---
function formatDate(ds) { if (!ds) return '«__» _______ ____ г.'; const d=new Date(ds),m=["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"]; return `«${d.getDate()}» ${m[d.getMonth()]} ${d.getFullYear()} г.`; }

function numberInputHandler(event) {
    const input = event.target;
    let value = input.value;
    const rawValue = value.replace(/\s/g, '');
    if (/[^0-9.,]/.test(rawValue)) { input.classList.add('input-error'); }
    else { input.classList.remove('input-error'); }
    const formattedValue = rawValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
    if(input.value !== formattedValue) input.value = formattedValue;
}
document.querySelectorAll('.number-input').forEach(input => input.addEventListener('input', numberInputHandler));

document.querySelectorAll('input[name="change-mode"]').forEach(r=>r.addEventListener('change',e=>{document.getElementById('monetary-changes-wrapper').classList.toggle('visible',e.target.value==='monetary');document.getElementById('info-changes-wrapper').classList.toggle('visible',e.target.value==='info');}));
document.querySelectorAll('input[name="info-change-type"]').forEach(r=>r.addEventListener('change',e=>{document.getElementById('info-general-details').classList.toggle('visible',e.target.value==='general');document.getElementById('info-insured-details').classList.toggle('visible',e.target.value==='insured');}));

let personId=0;function addPerson(type){personId++;const c=document.getElementById(`${type}-list-container`),r=document.createElement('div');r.className='person-row';r.id=`p-${personId}`;r.innerHTML=`<input type="text" placeholder="ФИО" class="person-fio"><input type="text" placeholder="ИИН" class="person-iin"><button type="button" class="cyber-button small" onclick="document.getElementById('p-${personId}').remove()">X</button>`;c.appendChild(r)}

function calculateTotals() {
    const parse = (id) => parseFloat(document.getElementById(id).value.replace(/\s/g, '')) || 0;
    const type = document.querySelector('input[name="sum-change-type"]:checked').value;
    ['sum', 'premium'].forEach(prefix => {
        if (document.getElementById(`${prefix}-no-change`).checked) return;
        const initial = parse(`${prefix}-initial`);
        const delta = parse(`${prefix}-delta`);
        const total = (type === 'увеличилась') ? initial + delta : initial - delta;
        document.getElementById(`${prefix}-total`).value = total > 0 ? total.toLocaleString('ru-RU') : '0';
    });
}
document.querySelectorAll('.calc-trigger').forEach(el => el.addEventListener('input', calculateTotals));
document.querySelectorAll('input[name="sum-change-type"]').forEach(el => el.addEventListener('change', calculateTotals));

document.querySelectorAll('.no-change-toggle').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const target = this.dataset.target;
        const isChecked = this.checked;
        document.querySelectorAll(`.${target}-fields input`).forEach(input => {
            input.disabled = isChecked;
            if(isChecked) input.value = '';
        });
        calculateTotals();
    });
});

// --- ГЛАВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ ---
function generateText() {
    if (document.querySelectorAll('.input-error').length > 0) { alert('ОШИБКА: Проверьте ввод сумм.'); return; }
    let textParts = [], itemCounter = 1;
    const mainMode = document.querySelector('input[name="change-mode"]:checked').value;

    textParts.push(`${itemCounter++}. Основанием для заключения настоящего Дополнительного соглашения является ${document.getElementById('base-document').value} Вх.№${document.getElementById('incoming-doc-number').value || '______'} от ${formatDate(document.getElementById('incoming-doc-date').value)}`);
    textParts.push(`${itemCounter++}. Предметом настоящего Дополнительного соглашения является внесение изменений в Договор ${document.getElementById('insurance-type').value} (далее-Договор) № ${document.getElementById('main-contract-number').value || '__________'} от ${formatDate(document.getElementById('main-contract-date').value)}`);

    if (mainMode === 'monetary') {
        const appendixNumber = document.getElementById('appendix-number-monetary').value;
        if (appendixNumber.trim()) { textParts.push(`${itemCounter++}. Стороны договорились внести изменения согласно приложения №${appendixNumber.trim()} к настоящему соглашению.`); }

        const changeType = document.querySelector('input[name="sum-change-type"]:checked').value;
        const formatOutput = (id) => document.getElementById(id).value;

        let monetaryChanges = [];
        if (!document.getElementById('sum-no-change').checked) {
            const sumDelta = formatOutput('sum-delta'), sumTotal = formatOutput('sum-total');
            monetaryChanges.push(`«Страховая сумма» ${changeType} на ${sumDelta} (${numberToWordsRu(sumDelta)}) тенге и составляет ${sumTotal} (${numberToWordsRu(sumTotal)}) тенге.`);
        }
        if (!document.getElementById('premium-no-change').checked) {
            const premiumDelta = formatOutput('premium-delta'), premiumTotal = formatOutput('premium-total');
            monetaryChanges.push(`«Страховая премия» ${changeType} на ${premiumDelta} (${numberToWordsRu(premiumDelta)}) тенге и составляет ${premiumTotal} (${numberToWordsRu(premiumTotal)}) тенге.`);
        }

        if(monetaryChanges.length > 0) {
             textParts.push(`${itemCounter++}. Стороны договорились внести изменения в следующие графы договора и изложить их в новой редакции:\n${monetaryChanges.join('\n')}`);
        }

        const paymentDueDate = document.getElementById('payment-due-date').value;
        if (!document.getElementById('premium-no-change').checked && paymentDueDate) {
            const actionText = changeType === 'увеличилась' ? `доплата страховой премии Страхователем` : `возврат части страховой премии Страховщиком`;
            textParts.push(`${itemCounter++}. Предусмотрена ${actionText} в срок до ${formatDate(paymentDueDate)}`);
        }

    } else {
        const infoType = document.querySelector('input[name="info-change-type"]:checked').value;
        if (infoType === 'general') { textParts.push(`${itemCounter++}. ${document.getElementById('info-general-text').value}`); }
        else if (infoType === 'insured') {
            let addList = [], excludeList = [];
            document.querySelectorAll('#add-list-container .person-row').forEach((r, i) => { const f = r.querySelector('.person-fio').value; if(f) addList.push(`${i+1}. ${f}, ИИН: ${r.querySelector('.person-iin').value||'[не указ.]'}`); });
            document.querySelectorAll('#exclude-list-container .person-row').forEach((r, i) => { const f = r.querySelector('.person-fio').value; if(f) excludeList.push(`${i+1}. ${f}, ИИН: ${r.querySelector('.person-iin').value||'[не указ.]'}`); });

            if(addList.length > 0) { textParts.push(`${itemCounter++}. Стороны договорились добавить в список Застрахованных следующих лиц:\n${addList.join('\n')}`); }
            if(excludeList.length > 0) { textParts.push(`${itemCounter++}. Стороны договорились исключить из списка Застрахованных следующих лиц:\n${excludeList.join('\n')}`); }
        }
    }

    textParts.push(`${itemCounter++}. Настоящее Дополнительное соглашение вступает в силу с даты подписания Сторонами.`);
    textParts.push(`${itemCounter++}. Остальные пункты и условия Договора, не затронутые настоящим Дополнительным соглашением, остаются неизменными.`);
    textParts.push(`${itemCounter++}. Настоящее Дополнительное соглашение составлено в двух подлинных экземплярах, имеющих одинаковую юридическую силу.`);

    document.getElementById('result-text').value = textParts.join('\n\n');
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    if(evt.currentTarget) {
        evt.currentTarget.className += " active";
    }

    if (tabName === 'new-design') {
        document.body.classList.add('new-design-body');
    } else {
        document.body.classList.remove('new-design-body');
    }
}

// Set the default tab to be open
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('old-design').style.display = 'block';
});
