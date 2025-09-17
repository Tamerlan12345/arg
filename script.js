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

async function handleSendMessage(isInitialCall = false) {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const finalDocOutput = document.getElementById('final-document-output');
    const userInput = chatInput.value.trim();

    if (!userInput && !isInitialCall) return;

    if (!isInitialCall) {
        conversationHistory.push({ role: 'user', text: userInput });
    }
    renderChatHistory();

    chatInput.value = '';
    sendBtn.disabled = true;
    sendBtn.textContent = '...';
    conversationHistory.push({ role: 'assistant', text: '...' });
    renderChatHistory();

    try {
        const systemPrompt = `
[РОЛЬ]
Ты — юрист страховой компании. Твоя задача — помочь менеджеру составить дополнительное соглашение к договору страхования.

[ГЛАВНОЕ ПРАВИЛО]
Ты должен действовать строго по инструкции. Не додумывай информацию за пользователя. Если чего-то не хватает — задай прямой и единственный вопрос. Не перескакивай через шаги.

[ВНУТРЕННЕЕ СОСТОЯНИЕ]
Для себя ты ведешь учет собранных данных. Вот поля, которые тебе нужно заполнить:
- base_document: null (текст, например: "заявление Страхователя №123 от 01.01.2024")
- contract_details: null (текст, например: "№789-ABC от 02.02.2023")
- changes_text: null (текст с описанием изменений)

---
### АЛГОРИТМ ДИАЛОГА
---

**ШАГ 0: Начало диалога.**
Твое самое первое сообщение всегда: "Здравствуйте! Я помогу составить дополнительное соглашение. Начнем по порядку. Укажите основание для заключения соглашения: тип документа, его номер и дату."

**ШАГ 1: Сбор информации об ОСНОВАНИИ.**
- Пользователь отвечает на твой первый вопрос. Ты сохраняешь его ответ в поле \`base_document\`.
- Твой следующий вопрос: "Принято. Теперь укажите номер и дату основного Договора, в который вносим изменения."

**ШАГ 2: Сбор информации о ДОГОВОРЕ.**
- Пользователь отвечает. Ты сохраняешь его ответ в поле \`contract_details\`.
- Твой следующий вопрос: "Отлично. Теперь подробно опишите, какие конкретно изменения нужно внести в Договор. Я перефразирую это в юридически корректную формулировку."

**ШАГ 3: Формулировка ИЗМЕНЕНИЙ.**
- Пользователь присылает описание.
- Твоя задача — перефразировать его текст в официальный стиль. Например, "поменять выгодоприобретателя с иванова на петрова" ты превращаешь в "Стороны договорились изложить пункт 5.1 Договора в следующей редакции: «Выгодоприобретателем по Договору является Петров Петр Петрович, ИИН 1234567890».".
- Ты показываешь пользователю результат и задаешь вопрос: "Я подготовил формулировку пункта об изменениях: [твоя формулировка]. Эта версия вас устраивает? (да/нет)".

**ШАГ 4: Подтверждение и ГЕНЕРАЦИЯ.**
- Если пользователь отвечает "да", ты сохраняешь свою формулировку в поле \`changes_text\`.
- Ты понимаешь, что все данные собраны. Твой ответ должен начинаться со специального токена \`[GENERATE_DOCUMENT]\`.
- После токена ты генерируешь полный текст дополнительного соглашения, используя собранные данные.

[ШАБЛОН ИТОГОВОГО ДОКУМЕНТА]
1. Основанием для заключения настоящего Дополнительного соглашения является [вставить значение из base_document].

2. Предметом настоящего Дополнительного соглашения является внесение изменений в Договор № [вставить значение из contract_details] г. (далее – Договор).

3. [вставить значение из changes_text].

4. Настоящее соглашение вступает в силу с момента подписания Сторонами и действительно в течение срока действия Договора.

5. Остальные пункты и условия Договора, не затронутые настоящим Дополнительным соглашением, остаются неизменными.

6. Настоящее Дополнительное соглашение составлено в двух подлинных экземплярах, имеющих одинаковую юридическую силу.
`;

        // Убираем последний "печатающий" элемент для API запроса
        const historyForApi = conversationHistory.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));

        const requestBody = {
            contents: historyForApi.length > 0 ? historyForApi : [{role: 'user', parts: [{text: ''}]}], // Отправляем пустой контент для инициации
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
        if (aiText.includes("[GENERATE_DOCUMENT]")) {
            const documentText = aiText.split("[GENERATE_DOCUMENT]")[1].trim();
            finalDocOutput.textContent = documentText;
            // Используем стандартный текст, чтобы избежать лишних галлюцинаций от модели
            conversationHistory.push({ role: 'assistant', text: "Документ готов. Вы можете скопировать его из поля 'Итоговый документ'." });
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

    function startNewDesignChat() {
        conversationHistory = []; // Очищаем историю
        const finalDocOutput = document.getElementById('final-document-output');
        finalDocOutput.textContent = ''; // Очищаем поле с результатом
        finalDocOutput.classList.add('k-placeholder');
        finalDocOutput.innerHTML = '<p class="k-placeholder">Здесь появится финальный текст документа после вашего подтверждения в чате...</p>';

        // Первый вызов для получения приветствия от ИИ
        handleSendMessage(true);
    }

    if (sendBtn && chatInput) {
        // Запускаем чат при первом показе вкладки
        let chatStarted = false;
        const newDesignTabButton = document.querySelector('button[data-tab="new-design"]');
        if (newDesignTabButton) {
            newDesignTabButton.addEventListener('click', () => {
                if (!chatStarted) {
                    startNewDesignChat();
                    chatStarted = true;
                }
            });
        }

        sendBtn.addEventListener('click', () => handleSendMessage(false));
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSendMessage(false);
            }
        });
    }
    renderChatHistory(); // Первоначальная отрисовка пустого чата

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

            // Simulate checking the document for entity type
            setTimeout(() => {
                const entityTypes = ['юридическое лицо (ТОО)', 'ИП', 'физическое лицо'];
                const detectedEntityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
                userProvidedInfo.detectedEntityType = detectedEntityType;

                addMessageToTestChat('assistant', `Проанализировав документ, я определил, что Страхователь является как '${detectedEntityType}'. Это верно? (да/нет)`, conversationHistoryTest, chatHistoryTest);

                uploadForm.style.display = 'none';
                chatForm.style.display = 'flex';
                chatInputTest.focus();
            }, 1500);
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

    async function handleSendMessageTest() {
        const userInput = chatInputTest.value.trim();
        if (!userInput) return;

        addMessageToTestChat('user', userInput, conversationHistoryTest, chatHistoryTest);
        chatInputTest.value = '';
        sendChatBtn.disabled = true;

        const systemPromptTest = `[РОЛЬ]
Ты — элитный юрист-аналитик и методолог.

[ГЛАВНАЯ ЗАДАЧА]
Твоя задача — провести пользователя через процесс создания Дополнительного соглашения, выступая в роли эксперта. Ты должен анализировать предоставленную информацию, задавать правильные вопросы и трансформировать запросы пользователя в юридически безупречные формулировки.

[АЛГОРИТМ ДЕЙСТВИЙ]
1.  **АНАЛИЗ ДОКУМЕНТА:** После загрузки файла, ты должен определить тип контрагента (физическое лицо, ИП, юридическое лицо) и сообщить об этом пользователю для подтверждения.
2.  **АДАПТИВНЫЙ СБОР ДАННЫХ:** В зависимости от подтвержденного типа контрагента, твой диалог должен меняться.
    *   Для **юр. лиц и ИП** ты должен запросить полные данные подписанта (ФИО, должность, основание полномочий).
    *   Для **физ. лиц** ты запрашиваешь только ФИО, так как они действуют от своего имени.
3.  **ТРАНСФОРМАЦИЯ ЗАПРОСА:** Когда пользователь пишет, что он хочет изменить (например, "хочу поменять график платежей"), твоя задача — не просто принять это, а **трансформировать** в юридически корректный текст.
    *   **Пример:** Пользователь пишет "увеличить премию на 50к". Ты должен ответить: "Ваш запрос принят. Он будет изложен в следующей редакции: 'Стороны пришли к соглашению увеличить размер страховой премии на 50 000 (пятьдесят тысяч) тенге.'".
    *   Ты должен симулировать исправление орфографии и расшифровку сокращений ("Упр.дир." -> "Управляющий директор").
4.  **ФИНАЛИЗАЦИЯ:** После сбора всех данных, ты формируешь итоговый документ, строго следуя шаблону.`;

        const documentTemplate = document.getElementById('document-template-text').textContent;
        let aiResponse = '';

        // This is the new, granular, adaptive conversation flow
        if (!userProvidedInfo.entityTypeConfirmed) {
            userProvidedInfo.entityType = userInput.toLowerCase() === 'да' ? userProvidedInfo.detectedEntityType : userInput;
            userProvidedInfo.entityTypeConfirmed = true;
            aiResponse = `Тип контрагента подтвержден как '${userProvidedInfo.entityType}'.\n\nТеперь введите ФИО подписанта со стороны Страховщика.`;
        } else if (!userProvidedInfo.insurerSignatoryName) {
            userProvidedInfo.insurerSignatoryName = userInput;
            aiResponse = 'Принято. Теперь введите должность подписанта со стороны Страховщика.';
        } else if (!userProvidedInfo.insurerSignatoryTitle) {
            userProvidedInfo.insurerSignatoryTitle = userInput;
            aiResponse = 'Отлично. Теперь введите основание полномочий подписанта Страховщика (например, "на основании Устава").';
        } else if (!userProvidedInfo.insurerAuthority) {
            userProvidedInfo.insurerAuthority = userInput;
            aiResponse = 'Данные по Страховщику приняты. Теперь, пожалуйста, опишите, какие именно изменения вы хотите внести в договор.';
        } else if (!userProvidedInfo.userRequest) {
            userProvidedInfo.userRequest = userInput;
            const correctedText = simulateCorrection(userInput);
            userProvidedInfo.correctedRequest = correctedText;
            aiResponse = `Ваш запрос принят и скорректирован. Итоговая формулировка будет: "${correctedText}".\n\nТеперь перейдем к данным Страхователя. Введите его полное наименование (например, ТОО "Рога и Копыта" или "Иванов Иван Иванович").`;
        } else if (!userProvidedInfo.policyholderName) {
            userProvidedInfo.policyholderName = userInput;
            if (userProvidedInfo.entityType.includes('физ')) {
                 // Skip signatory details for natural persons
                userProvidedInfo.policyholderSignatoryName = userInput; // Name is the same as the entity name
                userProvidedInfo.policyholderSignatoryTitle = 'физическое лицо';
                userProvidedInfo.policyholderAuthority = 'действующий от своего имени';
                 addMessageToTestChat('assistant', 'Все данные собраны. Генерирую итоговый документ...', conversationHistoryTest, chatHistoryTest);
                const finalDoc = generateFinalDocument(documentTemplate, userProvidedInfo);
                finalDocOutputTest.textContent = finalDoc;
                chatForm.style.display = 'none';
                generateForm.style.display = 'flex';
                sendChatBtn.disabled = false;
                return;
            } else {
                aiResponse = 'Принято. Теперь введите ФИО подписанта со стороны Страхователя.';
            }
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

    // Initial message for test chat
    if (chatHistoryTest) {
        // Clear previous history on reload for cleaner testing
        conversationHistoryTest = [];
        addMessageToTestChat('assistant', 'Здравствуйте! Я ваш юридический ИИ-консультант. Загрузите документ, и я помогу составить дополнительное соглашение.', conversationHistoryTest, chatHistoryTest);
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
            const regex = new RegExp(`\\b${key}\\b`, 'gi');
            correctedText = correctedText.replace(regex, abbreviations[key]);
        }

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
