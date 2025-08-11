let conversationHistory = [];
const apiKey = 'AIzaSyAKTRThK4t2AVsrTiwJjnEEY-bdK6UHJho'; // User-provided API Key

document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-chat-btn');
    const chatInput = document.getElementById('chat-input');

    if (sendBtn && chatInput) {
        // Add welcome message to history on load
        conversationHistory.push({ role: 'assistant', text: 'Здравствуйте! Я ваш юридический ИИ-консультант. Опишите, какие изменения вы хотите внести в договор, и мы вместе подготовим документ.' });

        sendBtn.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent new line
                handleSendMessage();
            }
        });
    }
    renderChatHistory();
});

function renderChatHistory() {
    const chatHistoryDiv = document.getElementById('chat-history');
    if (!chatHistoryDiv) return;

    // Clear placeholder or existing messages
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

    // Auto-scroll to the latest message
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}

async function handleSendMessage() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const finalDocOutput = document.getElementById('final-document-output');

    const userInput = chatInput.value.trim();
    if (!userInput) return;

    // Add user message to history and render
    conversationHistory.push({ role: 'user', text: userInput });
    renderChatHistory();

    // Clear input and disable form
    chatInput.value = '';
    sendBtn.disabled = true;
    sendBtn.textContent = '...';

    // Add a temporary "typing" indicator for the assistant
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

        // Use slice to exclude the initial welcome message from the API call history
        const historyForApi = conversationHistory.slice(1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));

        const requestBody = {
            contents: historyForApi,
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            generationConfig: {
                temperature: 0.7,
                topK: 1,
                topP: 1,
                maxOutputTokens: 4096,
            }
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

        // Remove the "typing" indicator
        conversationHistory.pop();

        // Check if the response is the final document
        if (aiText.includes("ДОПОЛНИТЕЛЬНОЕ СОГЛАШЕНИЕ")) {
             finalDocOutput.textContent = aiText.trim();
             conversationHistory.push({ role: 'assistant', text: "Документ готов. Вы можете скопировать его из поля 'Итоговый документ' ниже." });
        } else {
            conversationHistory.push({ role: 'assistant', text: aiText.trim() });
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        // Remove the "typing" indicator
        conversationHistory.pop();
        conversationHistory.push({ role: 'assistant', text: `Произошла ошибка: ${error.message}` });
    } finally {
        renderChatHistory();
        sendBtn.disabled = false;
        sendBtn.textContent = 'Отправить';
        chatInput.focus();
    }
}
