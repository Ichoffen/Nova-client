const axios = require('axios');
const { marked } = require('marked');

const messagesDiv = document.getElementById('messages');
const textInput = document.getElementById('text');
const apiKeyInput = document.getElementById('api-key');

let history = [];

// Загрузка ключа
if(localStorage.getItem('claude_key')) apiKeyInput.value = localStorage.getItem('claude_key');
apiKeyInput.addEventListener('input', () => localStorage.setItem('claude_key', apiKeyInput.value));

function addMsg(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerHTML = role === 'ai' ? marked.parse(text) : text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

textInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = textInput.value.trim();
        const key = apiKeyInput.value.trim();
        if (!text || !key) return alert('Нужен текст и ключ!');

        textInput.value = '';
        addMsg('user', text);
        history.push({ role: "user", content: text });

        const loading = document.createElement('div');
        loading.className = 'msg ai';
        loading.innerHTML = '...';
        messagesDiv.appendChild(loading);

        try {
            const res = await axios.post('https://api.anthropic.com/v1/messages', {
                model: "claude-3-sonnet-20240229",
                max_tokens: 1024,
                messages: history
            }, { headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'dangerously-allow-browser': true } });

            loading.remove();
            const aiText = res.data.content[0].text;
            addMsg('ai', aiText);
            history.push({ role: "assistant", content: aiText });
        } catch (err) {
            loading.innerHTML = 'Ошибка: ' + (err.response?.data?.error?.message || err.message);
        }
    }
});
