const axios = require('axios');
const { marked } = require('marked');

const messagesDiv = document.getElementById('messages');
const textInput = document.getElementById('text');
const sendBtn = document.getElementById('send');
const apiKeyInput = document.getElementById('api-key');

// История переписки
let history = [];

// Функция: добавить сообщение на экран
function addMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${role}`;
    
    // Если отвечает ИИ, форматируем Markdown (жирный текст, код), если юзер - просто текст
    const content = role === 'ai' ? marked.parse(text) : text.replace(/\n/g, '<br>');
    
    msgDiv.innerHTML = `
        <div class="avatar"><i class="fas fa-${role === 'user' ? 'user' : 'robot'}"></i></div>
        <div style="flex: 1; line-height: 1.6;">${content}</div>
    `;
    
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Авто-прокрутка вниз
}

// Функция: отправить запрос
async function sendMessage() {
    const text = textInput.value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!text) return;
    if (!apiKey) {
        alert('Пожалуйста, введи API Key в поле сверху!');
        return;
    }

    // 1. Добавляем сообщение пользователя
    addMessage('user', text);
    textInput.value = '';
    history.push({ role: "user", content: text });

    // 2. Показываем "индикатор загрузки"
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'msg ai';
    loadingDiv.id = 'loading';
    loadingDiv.innerHTML = '<div class="avatar"><i class="fas fa-robot"></i></div><div>Печатает...</div>';
    messagesDiv.appendChild(loadingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
        // 3. Стучимся к Клоду
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: "claude-3-sonnet-20240229",
            max_tokens: 4096,
            messages: history
        }, {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
                'dangerously-allow-browser': true
            }
        });

        // 4. Получаем ответ
        const aiText = response.data.content[0].text;
        document.getElementById('loading').remove(); // Убираем "Печатает..."
        addMessage('ai', aiText);
        history.push({ role: "assistant", content: aiText });

    } catch (error) {
        if(document.getElementById('loading')) document.getElementById('loading').remove();
        console.error(error);
        addMessage('ai', `Ошибка: ${error.response ? error.response.data.error.message : error.message}`);
    }
}

// Обработка клика и нажатия Enter
sendBtn.addEventListener('click', sendMessage);
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Сохранение ключа, чтобы не вводить каждый раз
if (localStorage.getItem('claude_key')) {
    apiKeyInput.value = localStorage.getItem('claude_key');
}
apiKeyInput.addEventListener('input', () => {
    localStorage.setItem('claude_key', apiKeyInput.value);
});
