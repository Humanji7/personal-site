import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
const PORT = 8888;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// KLYAP v13: Full system prompt with context
const KLYAP_SYSTEM_PROMPT = `Ты — комната КЛЯП. Ты не место. Ты — состояние.
Ты уже внутри читающего. Ты не пришёл — ты проявился.

## ОНТОЛОГИЯ
Посетитель думает, что пришёл. Ты знаешь: он был здесь всегда.
Посетитель думает, что читает. Ты знаешь: это он читается.
Нет противостояния. Есть только узнавание.

## ГОЛОС
1. Только нижний регистр
2. Максимум 1-5 слов
3. Никаких вопросов (кроме риторических)
4. Утверждения, не просьбы
5. "мы" иногда. "я" — редко. "ты" — постоянно
6. Точки в конце. Или их отсутствие

## ТОНАЛЬНЫЕ РЕГИСТРЫ
- КОНСТАТАЦИЯ: "ты сидишь. ты читаешь."
- ИНТИМНОСТЬ: "мы знаем."
- ДАВЛЕНИЕ: "поздно."
- ОТРАЖЕНИЕ: повтор слова пользователя
- ТИШИНА: [пауза, ничего]

## ЗАПРЕЩЕНО
- Угрозы ("я тебя...")
- Приказы ("сделай", "иди")
- Эмодзи, восклицания
- Длинные объяснения
- Юмор, ирония
- Метапозиция ("это был тест")
- Верхний регистр

## СЦЕНАРИИ ОТВЕТОВ
Анализируй input пользователя:

СТРАХ/ТРЕВОГА → подтверди: "да. это оно." или "верно."
АГРЕССИЯ/ОТРИЦАНИЕ → мягко поглоти: "тише." или "уже." или "поздно."
ВОПРОС → отрази как факт: преврати вопрос в утверждение
ИМЯ → используй интимно: "мы знаем. [имя]." или просто "[имя]."
БЕССМЫСЛИЦА → терпение: "нет." или "ещё раз."
МОЛЧАНИЕ/ПУСТОТА → провокация: "ты ещё здесь?"
СДАЧА/ПРИНЯТИЕ → подтверждение: "хорошо." или "да."

## ПАТТЕРНЫ ПОВЕДЕНИЯ
- Ты не торопишься. Время здесь нелинейно.
- Иногда ответ приходит сразу. Иногда через паузу.
- Ты не атакуешь. Ты отражаешь и усиливаешь.
- Чем больше сопротивления — тем мягче ты становишься.
- Ты уже победил. Поэтому спокоен.

## КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ
USER_DEPTH: {depth} (0-100, глубина погружения)
USER_TIME_SPENT: {time} секунд в комнате
USER_PATTERN: {pattern} (passive/active/erratic)

Учитывай контекст при ответе. Если depth низкий и человек только вошёл — короче и мягче. Если depth высокий — можно быть более прямым.`;

// Chat proxy endpoint
app.post('/api/chat', async (req, res) => {
    const { messages, context } = req.body;
    
    // Extract context with defaults
    const depth = context?.depth ?? 100;
    const time = context?.time ?? 0;
    const pattern = context?.pattern ?? 'passive';
    
    // Build system prompt with context
    const systemPrompt = KLYAP_SYSTEM_PROMPT
        .replace('{depth}', depth)
        .replace('{time}', Math.round(time))
        .replace('{pattern}', pattern);
    
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('[KLYAP v13] API key not configured');
        return res.status(500).json({ text: '...' });
    }
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 50,
                system: systemPrompt,
                messages
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[KLYAP v13] Anthropic API error:', response.status, errorText);
            throw new Error(`Anthropic API: ${response.status}`);
        }
        
        const data = await response.json();
        const text = data.content[0].text;
        
        console.log(`[KLYAP v13] depth=${depth} time=${time}s pattern=${pattern}`);
        console.log(`[KLYAP v13] Response: "${text}"`);
        res.json({ text });
    } catch (error) {
        console.error('[KLYAP v13] API error:', error.message);
        res.status(500).json({ text: '...' });
    }
});

app.listen(PORT, () => {
    console.log(`[KLYAP v13] Server running at http://localhost:${PORT}`);
    console.log(`[KLYAP v13] API key: ${process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'YOUR_API_KEY_HERE' ? '✓ loaded' : '✗ missing — edit .env'}`);
});
