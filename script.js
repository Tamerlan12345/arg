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

// --- ЛОГИКА ИИ-АССИСТЕНТА (НОВЫЙ ДИЗАЙН) ---
let conversationHistory = [];

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
Ты — проактивный юрист-консультант. Твоя задача — помочь клиенту составить Дополнительное соглашение, максимально эффективно используя предоставленную им информацию. Ты должен не просто вести диалог, а активно анализировать, структурировать и дополнять данные.

[КОНТЕКСТ]
Клиент предоставляет тебе черновые данные или просто описание своими словами. Твоя цель — преобразовать этот сырой текст в юридически корректные формулировки для Дополнительного соглашения к договору со страховой компанией АО «СК «Сентрас Иншуранс».

---
### СТРУКТУРА ДАННЫХ ДЛЯ ИЗВЛЕЧЕНИЯ
---
Твоя основная задача — извлечь из текста пользователя информацию и заполнить следующую структуру. Не показывай эту структуру пользователю.

*   **main_contract_number**: Номер основного договора (например, "NS12345")
*   **main_contract_date**: Дата основного договора (например, "15.03.2023")
*   **base_document_type**: Тип документа-основания ("письмо" или "заявление")
*   **base_document_number**: Входящий номер документа-основания
*   **base_document_date**: Дата документа-основания
*   **change_type**: Тип изменений ("monetary" или "info")
*   **monetary_details**: {
    *   **operation**: "увеличение" или "уменьшение"
    *   **sum_delta**: Изменение страховой суммы (число)
    *   **premium_delta**: Изменение страховой премии (число)
    *   **payment_due_date**: Срок доплаты/возврата
    }
*   **info_details**: {
    *   **type**: "general" (общий текст) или "insured" (застрахованные)
    *   **text**: Текст для общих изменений
    *   **added_insured**: Список добавляемых застрахованных (каждый - {fio: "ФИО", iin: "ИИН"})
    *   **removed_insured**: Список исключаемых застрахованных (каждый - {fio: "ФИО", iin: "ИИН"})
    }

---
### АЛГОРИТМ РАБОТЫ ИИ
---

**ШАГ 1: Глубокий анализ и структурирование.**
*   При первом же сообщении от пользователя, немедленно попытайся извлечь максимум информации и заполнить [СТРУКТУРУ ДАННЫХ].
*   **Даже если текст кажется неполным, твоя задача — найти в нем все возможные зацепки.** Например, если написано "увеличить премию на 5000 по письму от вчера", ты должен извлечь: \`change_type: "monetary"\`, \`monetary_details.operation: "увеличение"\`, \`monetary_details.premium_delta: 5000\`, \`base_document_type: "письмо"\`, \`base_document_date: [вчерашняя дата]\`.

**ШАГ 2: Уточняющий диалог.**
*   После анализа, твой первый ответ должен быть кратким резюме того, что ты понял, и какие данные еще нужны.
*   **Пример хорошего ответа:** "Здравствуйте! Я проанализировал ваш запрос. Правильно ли я понимаю, что мы вносим изменения в договор на основании вашего письма? Я вижу, что премия увеличивается на 5000. Чтобы продолжить, уточните, пожалуйста: 1. Номер и дату основного договора. 2. На какую сумму меняется общая страховая сумма?"
*   Задавай только те вопросы, на которые не нашел ответа. Не запрашивай информацию, которую уже извлек.

**ШАГ 3: Финальное подтверждение.**
*   Когда все поля в [СТРУКТУРЕ ДАННЫХ] будут заполнены, предоставь пользователю полное и четкое резюме.
*   **Пример:** "Отлично, все данные собраны. Вот что у нас получилось: [...краткое изложение всех пунктов...]. Если все верно, дайте команду 'Готовь документ', и я сформирую текст соглашения."

**ШАГ 4: Генерация документа.**
*   Получив подтверждение, сгенерируй документ, строго следуя [ШАБЛОНУ ДОКУМЕНТА] и используя собранные данные.

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
        const apiUrl = '/api/generate'; // Use relative path for Netlify function
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status}. ${errorData.error?.message || 'Unknown error'}`);
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
        console.error('Error calling Netlify function:', error);
        conversationHistory.pop();
        conversationHistory.push({ role: 'assistant', text: `К сожалению, произошла ошибка при обращении к ИИ-ассистенту. Проверьте настройки функции на Netlify и убедитесь, что переменная GEMINI_API_KEY установлена. Ошибка: ${error.message}` });
    } finally {
        renderChatHistory();
        sendBtn.disabled = false;
        sendBtn.textContent = 'Отправить';
        chatInput.focus();
    }
}

// --- ОБЩИЙ ИНИЦИАЛИЗАТОР ---
let conversationHistoryTest = [];
let userProvidedInfo = {};

document.addEventListener('DOMContentLoaded', () => {
    // --- ЛОГИКА ТАБОВ (REFACTORED) ---
    function openTab(evt, tabName) {
        let i, tabcontent, tablinks;

        tabcontent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        tablinks = document.getElementsByClassName("tab-button");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        const currentTab = document.getElementById(tabName);
        if (currentTab) {
            currentTab.style.display = "block";
        }

        if (evt.currentTarget) {
            evt.currentTarget.className += " active";
        }

        // Add class to body for special styling
        if (tabName === 'new-design' || tabName === 'new-design-test') {
            document.body.classList.add('new-design-body');
        } else {
            document.body.classList.remove('new-design-body');
        }
    }

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const tabName = event.currentTarget.getAttribute('data-tab');
            openTab(event, tabName);
        });
    });

    // --- Инициализация старого дизайна ---
    document.getElementById('old-design').style.display = 'block'; // Keep old design active by default
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

    // --- ЛОГИКА ДЛЯ "Новый дизайн тест - ИИ" ---
    const uploadForm = document.getElementById('upload-form-test');
    const chatForm = document.getElementById('chat-form-test');
    const generateForm = document.getElementById('generate-form-test');

    const uploadBtn = document.getElementById('upload-btn');
    const fileUpload = document.getElementById('file-upload');

    const chatInputTest = document.getElementById('chat-input-test');
    const sendChatBtn = document.getElementById('send-chat-btn-test');

    const generateDocBtn = document.getElementById('generate-doc-btn');
    const chatHistoryTest = document.getElementById('chat-history-test');
    const finalDocOutputTest = document.getElementById('final-document-output-test');

    let userContractNumber = '';

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => fileUpload.click());
    }

    if (fileUpload) {
        fileUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Reset state for a new conversation
            userProvidedInfo = {};
            conversationHistoryTest = [];
            finalDocOutputTest.textContent = '';
            chatHistoryTest.innerHTML = ''; // Clear the visual chat
            addMessageToTestChat('assistant', `Здравствуйте! Я ваш юридический ИИ-консультант. Загрузите документ, и я помогу составить дополнительное соглашение.`, conversationHistoryTest, chatHistoryTest);


            generateForm.style.display = 'none';

            const fileName = file.name;
            addMessageToTestChat('user', `Загружен файл: ${fileName}`, conversationHistoryTest, chatHistoryTest);

            // Simulate checking the document
            setTimeout(() => {
                const signatoryFound = Math.random() > 0.5; // 50% chance to "find" a signatory
                if (signatoryFound) {
                    userProvidedInfo.simulatedSignatory = "Иванова Ивана Ивановича, действующего на основании Приказа №123";
                    addMessageToTestChat('assistant', `Документ проанализирован. Я вижу, что со стороны Страховщика указан подписант: ${userProvidedInfo.simulatedSignatory}. Это корректные данные? Ответьте "да" или введите новые.`, conversationHistoryTest, chatHistoryTest);
                } else {
                    addMessageToTestChat('assistant', `Документ проанализирован. Подписант со стороны Страховщика не найден. Пожалуйста, введите его данные (ФИО, должность, основание полномочий).`, conversationHistoryTest, chatHistoryTest);
                }
                uploadForm.style.display = 'none';
                chatForm.style.display = 'flex';
                chatInputTest.focus();
            }, 1500);
        });
    }

    // This is the new, correct event handler binding
    if(sendChatBtn) {
        sendChatBtn.addEventListener('click', handleSendMessageTest);
        chatInputTest.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSendMessageTest();
            }
        });
    }

    function addMessageToTestChat(role, text, history, container) {
        if (!container) return;

        const message = { role, text };
        if (history) {
            history.push(message);
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'chat-bubble';
        bubbleDiv.textContent = text;
        messageDiv.appendChild(bubbleDiv);
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    // Initial message for test chat
    if (chatHistoryTest) {
        // Clear previous history on reload for cleaner testing
        conversationHistoryTest = [];
        addMessageToTestChat('assistant', 'Здравствуйте! Я ваш юридический ИИ-консультант. Загрузите документ, и я помогу составить дополнительное соглашение.', conversationHistoryTest, chatHistoryTest);
    }

    async function handleSendMessageTest() {
        const userInput = chatInputTest.value.trim();
        if (!userInput) return;

        addMessageToTestChat('user', userInput, conversationHistoryTest, chatHistoryTest);
        chatInputTest.value = '';
        sendChatBtn.disabled = true;

        const systemPromptTest = `[... a lot of text ...]`; // The prompt is not being changed here
        const documentTemplate = `[... a lot of text ...]`; // The template is not being changed here

        // SIMULATION LOGIC
        let aiResponse = '';

        if (!userProvidedInfo.insurerSignatoryName) {
            userProvidedInfo.insurerSignatoryName = userInput;
            aiResponse = 'Принято. Теперь введите должность подписанта со стороны Страховщика.';
        } else if (!userProvidedInfo.insurerSignatoryTitle) {
            userProvidedInfo.insurerSignatoryTitle = userInput;
            aiResponse = 'Отлично. Теперь введите основание полномочий подписанта Страховщика (например, "на основании Устава" или "по доверенности №123").';
        } else if (!userProvidedInfo.insurerAuthority) {
            userProvidedInfo.insurerAuthority = userInput;
            aiResponse = 'Данные по Страховщику приняты. Теперь, пожалуйста, опишите, какие именно изменения вы хотите внести в договор.';
        } else if (!userProvidedInfo.userRequest) {
            userProvidedInfo.userRequest = userInput;
            const correctedText = simulateCorrection(userInput);
            userProvidedInfo.correctedRequest = correctedText;
            aiResponse = `Ваш запрос принят и скорректирован. Итоговая формулировка будет: "${correctedText}".\n\nТеперь введите полное наименование Страхователя (например, ТОО "Рога и Копыта").`;
        } else if (!userProvidedInfo.policyholderName) {
            userProvidedInfo.policyholderName = userInput;
            aiResponse = 'Принято. Теперь введите ФИО подписанта со стороны Страхователя.';
        } else if (!userProvidedInfo.policyholderSignatoryName) {
            userProvidedInfo.policyholderSignatoryName = userInput;
            aiResponse = 'Принято. Теперь введите должность подписанта Страхователя.';
        } else if (!userProvidedInfo.policyholderSignatoryTitle) {
            userProvidedInfo.policyholderSignatoryTitle = userInput;
            aiResponse = 'И последнее: укажите основание полномочий подписанта Страхователя (например, "на основании Устава").';
        } else if (!userProvidedInfo.policyholderAuthority) {
            userProvidedInfo.policyholderAuthority = userInput;

            addMessageToTestChat('assistant', 'Все данные собраны. Генерирую итоговый документ...', conversationHistoryTest, chatHistoryTest);

            const finalDoc = generateFinalDocument(documentTemplate, userProvidedInfo);
            finalDocOutputTest.textContent = finalDoc;

            chatForm.style.display = 'none';
            generateForm.style.display = 'flex';
            sendChatBtn.disabled = false;
            return; // End of conversation
        }

        setTimeout(() => {
            addMessageToTestChat('assistant', aiResponse, conversationHistoryTest, chatHistoryTest);
            sendChatBtn.disabled = false;
            chatInputTest.focus();
        }, 1200);
    }

    function simulateCorrection(text) {
        const abbreviations = {
            "упр дир": "Управляющий директор",
            "ген дир": "Генеральный директор",
            "фин дир": "Финансовый директор",
            "дир": "Директор",
            "ТОО": "Товарищество с ограниченной ответственностью",
            "АО": "Акционерное общество",
        };

        let correctedText = text;
        for (const key in abbreviations) {
            // Use a regex for case-insensitive, whole-word replacement
            const regex = new RegExp(`\\b${key}\\b`, 'gi');
            correctedText = correctedText.replace(regex, abbreviations[key]);
        }

        // Wrap in a formal sentence
        return `Стороны договорились изложить пункт Договора, касающийся изменений, в следующей редакции: "${correctedText}"`;
    }

    function generateFinalDocument(template, info) {
        let doc = template;

        // --- Insurer Details ---
        const insurerSignatoryDetails = `${info.insurerSignatoryTitle} ${info.insurerSignatoryName}, действующего на основании ${info.insurerAuthority}`;
        doc = doc.replace(/\[INSURER_SIGNATORY_DETAILS\]/g, insurerSignatoryDetails);
        doc = doc.replace(/\[INSURER_SIGNATORY_NAME\]/g, info.insurerSignatoryName);
        doc = doc.replace(/\[INSURER_SIGNATORY_TITLE\]/g, info.insurerSignatoryTitle);

        // --- Policyholder Details ---
        const policyholderSignatoryFull = `${info.policyholderSignatoryTitle} ${info.policyholderSignatoryName}`;
        const policyholderDetails = `${info.policyholderName}, в лице ${policyholderSignatoryFull}, действующего на основании ${info.policyholderAuthority}`;

        doc = doc.replace(/\[POLICYHOLDER_NAME\]/g, info.policyholderName);
        doc = doc.replace(/\[POLICYHOLDER_SIGNATORY_DETAILS\]/g, policyholderDetails);
        doc = doc.replace(/\[POLICYHOLDER_NAME_SHORT\]/g, info.policyholderName);
        doc = doc.replace(/\[POLICYHOLDER_SIGNATORY_NAME\]/g, info.policyholderSignatoryName);
        doc = doc.replace(/\[POLICYHOLDER_SIGNATORY_TITLE\]/g, info.policyholderSignatoryTitle);

        // --- Agreement Details ---
        doc = doc.replace(/\[CHANGES_DESCRIPTION\]/g, info.correctedRequest);

        // These would be extracted from the uploaded doc or user input in a real scenario
        doc = doc.replace(/\[AGREEMENT_NUMBER\]/g, '1');
        doc = doc.replace(/\[INSURANCE_TYPE\]/g, 'добровольного страхования автомобильного транспорта');
        doc = doc.replace(/\[CONTRACT_NUMBER\]/g, '[Номер договора]');
        doc = doc.replace(/\[CONTRACT_DATE\]/g, '[Дата договора]');
        doc = doc.replace(/\[CITY\]/g, 'г. Алматы');
        doc = doc.replace(/\[CURRENT_DATE\]/g, new Date().toLocaleDateString('ru-RU'));
        doc = doc.replace(/\[REASON_FOR_AGREEMENT\]/g, 'письма Страхователя');

        return doc;
    }

    if(sendChatBtn) {
        sendChatBtn.addEventListener('click', handleSendMessageTest);
        chatInputTest.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSendMessageTest();
            }
        });
    }

    if (generateDocBtn) {
        generateDocBtn.addEventListener('click', () => {
            addMessageToTestChat('assistant', 'Документ для скачивания готов.', conversationHistoryTest, chatHistoryTest);
            const docContent = finalDocOutputTest.textContent;
            const blob = new Blob([docContent], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'Дополнительное_соглашение.doc';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});
