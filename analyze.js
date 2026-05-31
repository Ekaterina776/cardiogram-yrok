// api/analyze.js (Скрытый серверный ИИ-обработчик)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }

    // Сюда мы безопасно передадим ключ из настроек окружения хостинга (не в коде!)
    const apiKey = process.env.GEMINI_API_KEY;
    const { lessonTitle, data } = req.body;

    let studentSummary = "";
    data.forEach((item, idx) => {
        studentSummary += `Задание №${idx+1}: "${item.task}". Результат: ${item.score}.\n`;
    });

    const promptText = `Ты — опытный школьный учитель русского языка и литературы. К тебе пришел ученик после урока "${lessonTitle}".
Вот список заданий и его честная оценка своих успехов:
${studentSummary}

Сделай подробный разбор для ученика по каждому заданию отдельно:
1. Если ученик отметил "Отлично", похвали его.
2. Если ученик отметил "Удовлетворительно" или "Плохо", ты должен САМ изучить формулировку задания, понять правило русского языка или литературы, объяснить это правило простым языком, дать шпаргалку и алгоритм выполнения.

Каждое задание оберни в <div class="rec-item">. Используй <h4> для заголовков, <strong> для терминов, списки <ul>/<li>. Отвечай строго на русском языке.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const apiResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        const result = await apiResponse.json();
        let aiText = result.candidates[0].content.parts[0].text;
        aiText = aiText.replace(/```html/g, "").replace(/```/g, "").trim();

        return res.status(200).json({ analysis: aiText });
    } catch (error) {
        return res.status(500).json({ error: 'Ошибка генерации текста нейросетью' });
    }
}