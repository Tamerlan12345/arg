document.addEventListener('DOMContentLoaded', () => {
    const aiGenerateBtn = document.getElementById('ai-generate-btn');
    if (aiGenerateBtn) {
        aiGenerateBtn.addEventListener('click', handleAiGeneration);
    }
});

async function handleAiGeneration() {
    const apiKey = 'AIzaSyAKTRThK4t2AVsrTiwJjnEEY-bdK6UHJho'; // User-provided API Key
    const promptInput = document.getElementById('ai-prompt');
    const resultTextarea = document.getElementById('ai-result-text');
    const generateBtn = document.getElementById('ai-generate-btn');

    const userPrompt = promptInput.value;
    if (!userPrompt.trim()) {
        alert('Пожалуйста, введите ваш запрос в текстовое поле.');
        return;
    }

    // Disable button and show loading state
    generateBtn.disabled = true;
    generateBtn.textContent = 'Обработка...';
    resultTextarea.value = 'Пожалуйста, подождите, ИИ обрабатывает ваш запрос...';

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: `Ты — юридический ИИ-ассистент. Твоя задача — анализировать запрос пользователя и на его основе составлять пункты для дополнительного соглашения к договору страхования. Ответ должен быть четким, структурированным и содержать только текст пунктов соглашения.

                Вот примеры твоей работы:
                - Если пользователь пишет: "увеличить страховую сумму на 50 000 до 1 050 000, премию на 2 000 до 22 000", ты должен вернуть:
                "«Страховая сумма» увеличилась на 50 000 (пятьдесят тысяч) тенге и составляет 1 050 000 (один миллион пятьдесят тысяч) тенге.
                «Страховая премия» увеличилась на 2 000 (две тысячи) тенге и составляет 22 000 (двадцать две тысячи) тенге."
                - Если пользователь пишет: "изменить пункт 5.1 договора на 'Стороны договорились об оплате через банк'", ты должен вернуть:
                "Пункт 5.1 Договора изложить в следующей редакции: 'Стороны договорились об оплате через банк'."
                - Если пользователь пишет: "включить в список застрахованных Иванова Ивана Ивановича, ИИН 123456789012", ты должен вернуть:
                "Стороны договорились добавить в список Застрахованных следующее лицо: Иванов Иван Иванович, ИИН: 123456789012."

                Проанализируй следующий запрос и предоставь готовый текст для соглашения:
                ---
                ${userPrompt}
                ---
                `
            }]
        }],
        generationConfig: {
            temperature: 0.4,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Ошибка API: ${response.status} ${response.statusText}. ${errorData.error.message}`);
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        resultTextarea.value = generatedText.trim();

    } catch (error) {
        console.error('Ошибка при вызове Gemini API:', error);
        resultTextarea.value = `Произошла ошибка: ${error.message}\n\nПожалуйста, проверьте API-ключ и настройки сети.`;
    } finally {
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.textContent = 'Сгенерировать с помощью ИИ';
    }
}
