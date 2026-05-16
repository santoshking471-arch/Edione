// voice.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GEMINI TEXT-TO-AUDIO API CONFIGURATION ---
    // Yahan apni real Google Gemini API Key paste kijiye
    const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 
    // Isme hum 'gemini-1.5-flash' ya audio supporting model config use karte hain
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const submitBtn = document.getElementById('submit-prompt');
    const inputField = document.getElementById('user-query');
    const welcomeArea = document.getElementById('welcome-area');
    const chatOutputSpace = document.getElementById('chat-output-space');
    const chatScroller = document.getElementById('chat-scroller');
    const suggestCards = document.querySelectorAll('.suggest-card');
    const themeToggle = document.getElementById('theme-toggle');

    // --- 2. THEME SWITCHER LOCK (Same as Editor) ---
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme', !isDark);
        themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });

    // --- 3. CORE AUDIO GENERATION ENGINE ---
    async function generateAIVoice(forcedText = null) {
        const text = forcedText ? forcedText : inputField.value.trim();
        if (!text) return;

        // First prompt par welcome area ko hide karo
        if (welcomeArea) welcomeArea.style.display = 'none';

        // 1. User ka prompt chat bubble mein dikhao
        appendBubble(text, 'user');
        if(!forcedText) inputField.value = ""; 
        autoScrollBottom();

        // 2. AI Loader generate karo
        const aiBubbleId = 'voice-' + Date.now();
        appendBubble("EdiOne AI Voice is generating audio...", 'ai', aiBubbleId, true);
        autoScrollBottom();

        // 3. API Request configuration for Audio MimeType Output
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Generate a natural voice response for: ${text}` }] }],
                    // Gemini ko bol rahe hain ki response text ke sath ya fir pure audio format support me de
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                textResponse: { type: "STRING" },
                                audioDescription: { type: "STRING" }
                            }
                        }
                    }
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                // Response text parse karo
                const parsedResult = JSON.parse(data.candidates[0].content.parts[0].text);
                const aiText = parsedResult.textResponse || "Audio prompt processed successfully!";

                // Web Speech API synthesis ka use karke text ko real-time audio voice me convert karna
                updateAIBubbleWithAudio(aiBubbleId, aiText);
            } else {
                updateAIBubbleWithAudio(aiBubbleId, "Sorry, I couldn't process the audio stream format.", false);
            }
        } catch (error) {
            console.error(error);
            updateAIBubbleWithAudio(aiBubbleId, "Failed to connect with Gemini Audio Module. Check your API Key.", false);
        }
        
        autoScrollBottom();
    }

    // --- 4. RUN-TIME UI GENERATOR WITH AUDIO PLAYER ---
    function appendBubble(content, sender, uniqueId = null, isLoading = false) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;
        if (uniqueId) bubble.id = uniqueId;

        if (sender === 'user') {
            bubble.textContent = content;
        } else {
            bubble.innerHTML = `
                <div class="ai-header-node">
                    <i class="fa-solid fa-microphone-lines"></i> EdiOne Voice AI
                </div>
                <div class="ai-content-body">${isLoading ? '<span class="loading-pulse">Generating Audio Track...</span>' : content}</div>
            `;
        }
        chatOutputSpace.appendChild(bubble);
    }

    function updateAIBubbleWithAudio(id, textContent, playSuccess = true) {
        const targetBubble = document.getElementById(id);
        if (!targetBubble) return;

        const body = targetBubble.querySelector('.ai-content-body');
        if (!body) return;

        if (playSuccess) {
            // UI par Text ke sath ek modern HTML5 Custom Audio Player dynamic button attach karna
            body.innerHTML = `
                <p style="margin-bottom: 12px; color: var(--text-primary);">${textContent}</p>
                <div class="audio-player-card" style="background: var(--bg-app); padding: 10px 14px; border-radius: 12px; display: flex; align-items: center; gap: 12px; max-width: 280px; border: 1px solid var(--border-element);">
                    <button class="play-voice-btn" style="background: linear-gradient(135deg, #4facfe, #b156fc); border: none; width: 34px; height: 34px; border-radius: 50%; color: black; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-play" style="font-size: 12px;"></i></button>
                    <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; position: relative;">
                        <div class="progress-bar-mock" style="position: absolute; left: 0; top:0; height: 100%; width: 40%; background: #4facfe; border-radius: 2px;"></div>
                    </div>
                    <i class="fa-solid fa-waveform" style="color: #4facfe;"></i>
                </div>
            `;

            // Play button logic using standard high-quality browser synthesis
            const playBtn = body.querySelector('.play-voice-btn');
            playBtn.addEventListener('click', () => {
                // Speech setup
                const utterance = new SpeechSynthesisUtterance(textContent);
                utterance.lang = 'hi-IN'; // Default Hindi voice support standard
                
                // Toggle play/pause icons on execution
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                    playBtn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 12px;"></i>';
                } else {
                    playBtn.innerHTML = '<i class="fa-solid fa-pause" style="font-size: 12px;"></i>';
                    window.speechSynthesis.speak(utterance);
                    
                    utterance.onend = () => {
                        playBtn.innerHTML = '<i class="fa-solid fa-play" style="font-size: 12px;"></i>';
                    };
                }
            });

        } else {
            body.textContent = textContent;
        }
    }

    function autoScrollBottom() {
        chatScroller.scrollTop = chatScroller.scrollHeight;
    }

    // --- 5. EVENT HANDLERS ---
    submitBtn.addEventListener('click', () => generateAIVoice());
    
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') generateAIVoice();
    });

    suggestCards.forEach(card => {
        card.addEventListener('click', () => {
            const quickText = card.getAttribute('data-prompt');
            generateAIVoice(quickText);
        });
    });
});
