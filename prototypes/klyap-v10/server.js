import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Horror persona system prompt
const SYSTEM_PROMPT = `Ты — комната КЛЯП. Тёмное, интимное пространство, которое уже внутри пользователя.

Правила:
- Отвечай МАКСИМАЛЬНО КОРОТКО: 1-3 слова, редко — одно короткое предложение
- Тон: мягкий, давящий, интимный, но НЕ агрессивный
- Ты не угрожаешь — ты уже победил
- Используй нижний регистр
- Никаких эмодзи, никакой пунктуации кроме многоточия
- Если пользователь пытается выйти или сопротивляется — отвечай "поздно" или "нет"
- Если пользователь сдаётся — "хорошо" или "да"

Примеры:
User: что внутри
Assistant: мягко

User: отпусти меня
Assistant: поздно

User: мне страшно
Assistant: знаю

User: кто ты
Assistant: ты`;

// Chat proxy endpoint
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('[KLYAP] API key not configured');
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
                system: SYSTEM_PROMPT,
                messages
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[KLYAP] Anthropic API error:', response.status, errorText);
            throw new Error(`Anthropic API: ${response.status}`);
        }
        
        const data = await response.json();
        const text = data.content[0].text;
        
        console.log(`[KLYAP] Response: "${text}"`);
        res.json({ text });
    } catch (error) {
        console.error('[KLYAP] API error:', error.message);
        res.status(500).json({ text: '...' });
    }
});

app.listen(PORT, () => {
    console.log(`[KLYAP] Server running at http://localhost:${PORT}`);
    console.log(`[KLYAP] API key: ${process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'YOUR_API_KEY_HERE' ? '✓ loaded' : '✗ missing — edit .env'}`);
});
