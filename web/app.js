const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');

function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'message ' + sender;
    msg.textContent = text;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

sendBtn.onclick = async function() {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    userInput.value = '';
    appendMessage('Thinking...', 'assistant');
    try {
        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        chatWindow.lastChild.textContent = data.reply;
        speakText(data.reply);
    } catch (e) {
        chatWindow.lastChild.textContent = 'Error: Could not reach assistant.';
    }
};

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        utter.rate = 1;
        utter.pitch = 1;
        utter.volume = 1;
        // Optionally, set a specific voice:
        // const voices = window.speechSynthesis.getVoices();
        // utter.voice = voices.find(v => v.name === 'Google US English') || null;
        window.speechSynthesis.speak(utter);
    }
}

userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendBtn.onclick();
});

// Greet on load
const greeting = 'Hi my name is Friday, your personal assistant, how may I help you?';
appendMessage(greeting, 'assistant');
speakText(greeting);

// Voice input using Web Speech API
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    micBtn.onclick = function() {
        if (micBtn.classList.contains('active')) {
            recognition.stop();
            micBtn.classList.remove('active');
            userInput.placeholder = 'Type your message...';
            return;
        }
        recognition.start();
        micBtn.classList.add('active');
        userInput.placeholder = 'Listening...';
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        micBtn.classList.remove('active');
        userInput.placeholder = 'Type your message...';
        sendBtn.onclick();
    };
    recognition.onerror = function(e) {
        micBtn.classList.remove('active');
        userInput.placeholder = 'Type your message...';
        alert('Speech recognition error: ' + (e.error || 'Unknown error'));
    };
    recognition.onend = function() {
        micBtn.classList.remove('active');
        userInput.placeholder = 'Type your message...';
    };
} else {
    micBtn.style.display = 'none';
}
