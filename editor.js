// editor.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GEMINI CORE API INTERFACE CONFIGURATION ---
    // Bas yahan par apni real Google Gemini API Key paste kar dena
    const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    const submitBtn = document.getElementById('submit-prompt');
    const inputField = document.getElementById('user-query');
    const welcomeArea = document.getElementById('welcome-area');
    const chatOutputSpace = document.getElementById('chat-output-space');
    const chatScroller = document.getElementById('chat-scroller');
    const suggestCards = document.querySelectorAll('.suggest-card');
    const themeToggle = document.getElementById('theme-toggle');

    // --- 2. THEME SWITCHER FUNCTIONALITY (Light / Dark) ---
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme', !isDark);
        
        // Icon change based on theme active state
        themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });

    // --- 3. CORE CHAT ENGINE FUNCTION ---
    async function sendMessageToGemini(forcedText = null) {
        const text = forcedText ? forcedText : inputField.value.trim();
        if (!text) return;

        // Welcome screen ko hide karo first prompt par
        if (welcomeArea) {
            welcomeArea.style.display = 'none';
        }

        // 1. User ka chat bubble UI par append karo
        appendBubble(text, 'user');
        if(!forcedText) inputField.value = ""; // Input Box clear kro
        autoScrollBottom();

        // 2. AI dynamic loading state placeholder render karo
        const aiBubbleId = 'ai-' + Date.now();
        appendBubble("EdiOne is processing query...", 'ai', aiBubbleId, true);
        autoScrollBottom();

        // 3. Real HTTP POST Network Request to Google Infrastructure
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }]
                })
            });

            const data = await response.json();
            
            // Check if response has parsed stream text correctly
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                const aiReplyText = data.candidates[0].content.parts[0].text;
                updateAIBubble(aiBubbleId, aiReplyText);
            } else {
                updateAIBubble(aiBubbleId, "Error: Invalid API response format structure.");
            }
        } catch (error) {
            console.error(error);
            updateAIBubble(aiBubbleId, "Network fail: API key sahi nahi hai ya connection block hua.");
        }
        
        autoScrollBottom();
    }

    // --- 4. RUN-TIME UI DOM GENERATOR UTILITIES ---
    function appendBubble(content, sender, uniqueId = null, isLoading = false) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;
        if (uniqueId) bubble.id = uniqueId;

        if (sender === 'user') {
            bubble.textContent = content;
        } else {
            // Gemini Profile response box layout
            bubble.innerHTML = `
                <div class="ai-header-node">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> EdiOne AI
                </div>
                <div class="ai-content-body">${isLoading ? '<span class="loading-pulse">Thinking...</span>' : content}</div>
            `;
        }
        chatOutputSpace.appendChild(bubble);
    }

    function updateAIBubble(id, newContent) {
        const targetBubble = document.getElementById(id);
        if (targetBubble) {
            const body = targetBubble.querySelector('.ai-content-body');
            if (body) body.textContent = newContent;
        }
    }

    function autoScrollBottom() {
        chatScroller.scrollTop = chatScroller.scrollHeight;
    }

    // --- 5. EVENT LISTENERS ACTIVATION MATRIX ---
    submitBtn.addEventListener('click', () => sendMessageToGemini());
    
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessageToGemini();
    });

    // Quick suggestion click handlers
    suggestCards.forEach(card => {
        card.addEventListener('click', () => {
            const quickText = card.getAttribute('data-prompt');
            sendMessageToGemini(quickText);
        });
    });
});
