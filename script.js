// --- БЛОК КОНВЕРТАЦИИ ЧИСЛА В ПРОПИСЬ (проверенная версия) ---
function numberToWordsRu(number) { const _n=Number(String(number).replace(/\s/g,''));if(isNaN(_n)|| _n===0)return'ноль'; const h=['','сто','двести','триста','четыреста','пятьсот','шестьсот','семьсот','восемьсот','девятьсот'],t=['','десять','двадцать','тридцать','сорок','пятьдесят','шестьдесят','семьдесят','восемьдесят','девяносто'],o=['','один','два','три','четыре','пять','шесть','семь','восемь','девять'],e=['десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцать'],r=[['тысяча','тысячи','тысяч',1],['миллион','миллиона','миллионов',0],['миллиард','миллиарда','миллиардов',0]];function p(n,l){if(n===0)return'';let s=n%10,a=Math.floor(n/10)%10,d=Math.floor(n/100)%10,c='';if(d>0)c+=h[d]+' ';if(a===1)c+=e[s]+' ';else{c+=t[a]+' ';let g=l>0?r[l-1][3]:0;c+=(g===1&&(s===1||s===2))?(s===1?'одна ':'две '):o[s]+' '}if(l>0){if(s===1&&a!==1)c+=r[l-1][0];else if(s>1&&s<5&&a!==1)c+=r[l-1][1];else c+=r[l-1][2]}return c}let i=[],l=0,n=_n;while(n>0){i.push(p(n%1000,l));n=Math.floor(n/1000);l++}return i.reverse().join(' ').replace(/\s+/g,' ').trim()}

// --- УТИЛИТЫ И НАСТРОЙКИ UI (СТАРЫЙ ДИЗАЙН) ---
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

// --- ЛОГИКА ТАБОВ ---
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

// --- ЛОГИКА ИИ-АССИСТЕНТА (НОВЫЙ ДИЗАЙН) ---
let conversationHistory = [];
const apiKey = 'AIzaSyAKTRThK4t2AVsrTiwJjnEEY-bdK6UHJho';

function renderChatHistory() {
    const chatHistoryDiv = document.getElementById('chat-history');
    if (!chatHistoryDiv) return;
    chatHistoryDiv.innerHTML = '';
    conversationHistory.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.role}`;
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'chat-bubble';
        bubbleDiv.textContent = message.text;
        messageDiv.appendChild(bubbleDiv);
        chatHistoryDiv.appendChild(messageDiv);
    });
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}

async function handleSendMessage() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const finalDocOutput = document.getElementById('final-document-output');
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    conversationHistory.push({ role: 'user', text: userInput });
    renderChatHistory();

    chatInput.value = '';
    sendBtn.disabled = true;
    sendBtn.textContent = '...';
    conversationHistory.push({ role: 'assistant', text: '...' });
    renderChatHistory();

    try {
        const systemPrompt = `
[РОЛЬ]
Ты — интерактивный юрист-консультант, специализирующийся на договорном праве. Твоя главная задача — не просто сгенерировать документ, а провести клиента (меня) через процесс согласования изменений в договоре. Ты должен быть внимательным, проактивным и педантичным.

[КОНТЕКСТ]
Клиент предоставляет тебе черновые данные для составления Дополнительного соглашения к договору со страховой компанией АО «СК «Сентрас Иншуранс». Твоя работа состоит из двух этапов:
1.  **Обсуждение:** Сначала ты анализируешь предоставленные данные, задаешь уточняющие вопросы, указываешь на возможные несостыковки или риски, предлагаешь лучшие формулировки. Твоя цель на этом этапе — убедиться, что все детали верны и полностью согласованы.
2.  **Генерация:** Только ПОСЛЕ того, как я дам явное подтверждение (например, «Все верно, готовь документ»), ты приступаешь к созданию финального текста Дополнительного соглашения по строгому шаблону.

---
### АЛГОРИТМ РАБОТЫ ИИ
---

**ШАГ 1: Анализ и начало диалога.**
* Твой ПЕРВЫЙ ответ ДОЛЖЕН БЫТЬ началом диалога. НЕ генерируй документ сразу.
* Начни с приветствия и подтверди, что ты проанализировал запрос. Пример: «Здравствуйте! Я изучил ваш запрос. Прежде чем мы подготовим финальный документ, давайте уточним все детали.»

**ШАГ 2: Сбор и обсуждение информации.**
* **ПРИОРИТЕТ УТОЧНЕНИЯ:** Твоя главная задача — собрать **полную** информацию для всех полей в \\\`[ШАБЛОНЕ ДОКУМЕНТА]\\\`.
* Если в запросе пользователя не хватает каких-либо данных (например, номер договора, ФИО, даты, суммы, основание), ты **обязан** вежливо запросить эту информацию у пользователя. Задавай по одному-два вопроса за раз, чтобы не перегружать пользователя.
* Если видишь потенциальные проблемы (например, неоднозначные формулировки), вежливо укажи на это и предложи свой вариант.

**ШАГ 3: Финальное подтверждение.**
* Когда ты соберешь ВСЮ необходимую информацию, предоставь пользователю краткое резюме собранных данных.
* Закончи свой ответ фразой, призывающей к подтверждению. Пример: «Мы все уточнили. Если данные верны, дайте команду на создание документа (например, 'Все верно, готовь документ'), и я подготовлю итоговый текст».

**ШАГ 4: Генерация документа.**
* Получив от меня явное подтверждение, создай полный текст Дополнительного соглашения, используя \\\`[ШАБЛОН ДОКУМЕНТА]\\\` и финально согласованные данные.
* Строго следуй правилам: точное соответствие шаблону и форматирование чисел (цифрами и прописью), если это применимо.

---
### ШАБЛОН ДОКУМЕНТА (НЕИЗМЕНЯЕМЫЙ)
---

**ДОПОЛНИТЕЛЬНОЕ СОГЛАШЕНИЕ № [Номер доп. соглашения]**
к Договору добровольного страхования автомобильного транспорта № [Номер основного договора] от «[Дата основного договора]» г.

г. [Город] | «__» _______ 20__ г.

**АО «СК «Сентрас Иншуранс»**, именуемое в дальнейшем «Страховщик», в лице [Должность, ФИО представителя Страховщика], действующего на основании [Основание полномочий представителя], с одной стороны, и
**[Наименование Страхователя]**, именуемое в дальнейшем «Страхователь», в лице [Должность, ФИО представителя Страхователя], действующего на основании [Основание полномочий представителя], с другой стороны,
далее совместно именуемые «Стороны», заключили настоящее Дополнительное соглашение (далее – Соглашение) о нижеследующем:

1. Основанием для заключения настоящего Дополнительного соглашения является [Основание для заключения] Вх.№ [Номер входящего письма] от «[Дата входящего письма]» г.

2. Предметом настоящего Дополнительного соглашения является внесение изменений в Договор добровольного страхования автомобильного транспорта № [Номер основного договора] от «[Дата основного договора]» г. (далее – Договор).

3. Стороны договорились внести изменения в Договор и изложить их в следующей редакции:
[ЗДЕСЬ ДИНАМИЧЕСКИ СГЕНЕРИРОВАТЬ СПИСОК ИЗМЕНЕНИЙ ПОСЛЕ СОГЛАСОВАНИЯ]

4. Настоящее Дополнительное соглашение вступает в силу с даты подписания Сторонами.

5. Остальные пункты и условия Договора, не затронутые настоящим Дополнительным соглашением, остаются неизменными.

6. Настоящее Дополнительное соглашение составлено в двух подлинных экземплярах, имеющих одинаковую юридическую силу, по одному для каждой из Сторон.

**ПОДПИСИ СТОРОН:**

**СТРАХОВЩИК:** _______________
**АО «СК «Сентрас Иншуранс»**

**СТРАХОВАТЕЛЬ:** _______________
`;

        const historyForApi = conversationHistory.slice(1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));
        const requestBody = {
            contents: historyForApi,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.7, topK: 1, topP: 1, maxOutputTokens: 4096 }
        };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorData.error.message}`);
        }
        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        conversationHistory.pop();
        if (aiText.includes("ДОПОЛНИТЕЛЬНОЕ СОГЛАШЕНИЕ")) {
             finalDocOutput.textContent = aiText.trim();
             conversationHistory.push({ role: 'assistant', text: "Документ готов. Вы можете скопировать его из поля 'Итоговый документ' ниже." });
        } else {
            conversationHistory.push({ role: 'assistant', text: aiText.trim() });
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        conversationHistory.pop();
        conversationHistory.push({ role: 'assistant', text: `Произошла ошибка: ${error.message}` });
    } finally {
        renderChatHistory();
        sendBtn.disabled = false;
        sendBtn.textContent = 'Отправить';
        chatInput.focus();
    }
}

// --- ОБЩИЙ ИНИЦИАЛИЗАТОР ---
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация старого дизайна
    document.getElementById('old-design').style.display = 'block';
    document.querySelectorAll('.number-input').forEach(input => input.addEventListener('input', numberInputHandler));
    document.querySelectorAll('input[name="change-mode"]').forEach(r=>r.addEventListener('change',e=>{document.getElementById('monetary-changes-wrapper').classList.toggle('visible',e.target.value==='monetary');document.getElementById('info-changes-wrapper').classList.toggle('visible',e.target.value==='info');}));
    document.querySelectorAll('input[name="info-change-type"]').forEach(r=>r.addEventListener('change',e=>{document.getElementById('info-general-details').classList.toggle('visible',e.target.value==='general');document.getElementById('info-insured-details').classList.toggle('visible',e.target.value==='insured');}));
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

    // Инициализация нового дизайна (чата)
    const sendBtn = document.getElementById('send-chat-btn');
    const chatInput = document.getElementById('chat-input');
    if (sendBtn && chatInput) {
        conversationHistory.push({ role: 'assistant', text: 'Здравствуйте! Я ваш юридический ИИ-консультант. Опишите, какие изменения вы хотите внести в договор, и мы вместе подготовим документ.' });
        sendBtn.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSendMessage();
            }
        });
    }
    renderChatHistory();
});
