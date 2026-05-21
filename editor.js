// editor.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CORE MULTI-AI ENDPOINTS CONFIGURATION ---
    const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 
    
    // Gemini Pro Endpoint
    const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    // Meta AI (Llama Engine via Cloudflare/HuggingFace/Groq jo bhi aap integration use kar rahe hon)
    // Agar aapke paas abhi direct endpoint nahi hai, toh humne switch handler framework ready kar diya hai.
    const META_AI_ENDPOINT = `https://api.together.xyz/v1/chat/completions`; // Example standard Llama endpoint
    const META_API_KEY = "YOUR_META_API_KEY_HERE";

    // Default active AI engine 'gemini' ya 'meta'
    let activeAIEngine = 'gemini'; 

    const submitBtn = document.getElementById('submit-prompt');
    const inputField = document.getElementById('user-query');
    const welcomeArea = document.getElementById('welcome-area');
    const chatOutputSpace = document.getElementById('chat-output-space');
    const chatScroller = document.getElementById('chat-scroller');
    const suggestCards = document.querySelectorAll('.suggest-card');
    const themeToggle = document.getElementById('theme-toggle');

    // --- LOGIC ADDED: Dynamic Engine Switcher ---
    // (Aap apne UI header ya input bar mein ek button laga kar is function ko trigger kar sakte hain)
    window.switchAIEngine = (engineName) => {
        if(engineName === 'gemini' || engineName === 'meta') {
            activeAIEngine = engineName;
            console.log(`Active Engine Switched to: ${activeAIEngine.toUpperCase()}`);
        }
    };

    // --- 2. THEME SWITCHER FUNCTIONALITY ---
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme', !isDark);
        themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });

    // --- 3. UPGRADED VIDEO GENERATION & MULTI-AI CHAT ENGINE ---
    async function generateVideoContent(forcedText = null) {
        const userPrompt = forcedText ? forcedText : inputField.value.trim();
        if (!userPrompt) return;

        if (welcomeArea) welcomeArea.style.display = 'none';

        // 1. User ka chat bubble UI par render karo
        appendBubble(userPrompt, 'user');
        if(!forcedText) inputField.value = ""; 
        autoScrollBottom();

        // 2. Dynamic loader loader with current engine name
        const aiBubbleId = 'ai-' + Date.now();
        const currentEngineLabel = activeAIEngine === 'gemini' ? 'EdiOne (Gemini Pro)' : 'EdiOne (Meta AI)';
        appendBubble(`${currentEngineLabel} is generating video assets...`, 'ai', aiBubbleId, true);
        autoScrollBottom();

        // 3. Video Creation Context Injector Framework
        // Isse AI chat answer dene ke bajay proper short video blocks script design karega
        const systemVideoInstruction = `You are an advanced AI Video Generator. The user wants to create a video based on this request: "${userPrompt}". 
        Provide a complete structured video asset layout containing:
        1. Visual Scene Description (For text-to-video tools)
        2. Voiceover Speech/Audio Text
        3. Suggested B-Roll tags. Keep it highly engaging.`;

        // 4. Execution branching based on active selection
        if (activeAIEngine === 'gemini') {
            // --- GEMINI PRO CALL ---
            try {
                const response = await fetch(GEMINI_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: systemVideoInstruction }] }]
                    })
                });
                const data = await response.json();
                if (data.candidates && data.candidates[0].content.parts[0].text) {
                    updateAIBubble(aiBubbleId, data.candidates[0].content.parts[0].text, 'Gemini');
                } else {
                    updateAIBubble(aiBubbleId, "Error: Gemini model frame could not parse video assets.", 'Gemini');
                }
            } catch (error) {
                console.error(error);
                updateAIBubble(aiBubbleId, "Network Block: Gemini connection failed.", 'Gemini');
            }
        } else {
            // --- META AI (LLAMA ENGINE) CALL ---
            try {
                const response = await fetch(META_AI_ENDPOINT, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${META_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "meta-llama/Llama-3-70b-chat-hf", // Standard Meta AI engine identifier
                        messages: [{ role: "user", content: systemVideoInstruction }]
                    })
                });
                const data = await response.json();
                if (data.choices && data.choices[0].message.content) {
                    updateAIBubble(aiBubbleId, data.choices[0].message.content, 'Meta AI');
                } else {
                    updateAIBubble(aiBubbleId, "Error: Meta AI (Llama) engine failed to compile framework.", 'Meta AI');
                }
            } catch (error) {
                console.error(error);
                // Fallback simulation text agar aapke paas immediate key lagayi na ho
                updateAIBubble(aiBubbleId, `[Meta AI Simulation Mode]: Generating video clips assets for "${userPrompt}" using Llama framework. Connect real API bearer token for production output.`, 'Meta AI');
            }
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
            const currentBadge = activeAIEngine === 'gemini' ? 'fa-wand-magic-sparkles' : 'fa-meta'; // FontAwesome Meta logo icon switch support
            const currentName = activeAIEngine === 'gemini' ? 'EdiOne Gemini' : 'EdiOne Meta AI';
            
            bubble.innerHTML = `
                <div class="ai-header-node" style="color: ${activeAIEngine === 'gemini' ? '#4facfe' : '#3b82f6'}">
                    <i class="fa-solid ${currentBadge}"></i> ${currentName}
                </div>
                <div class="ai-content-body" style="white-space: pre-wrap;">${isLoading ? '<span class="loading-pulse">Compiling Video Scripts & Assets...</span>' : content}</div>
            `;
        }
        chatOutputSpace.appendChild(bubble);
    }

    function updateAIBubble(id, newContent, activeEngineLabel) {
        const targetBubble = document.getElementById(id);
        if (targetBubble) {
            const header = targetBubble.querySelector('.ai-header-node');
            const body = targetBubble.querySelector('.ai-content-body');
            
            if (header) {
                header.innerHTML = activeEngineLabel === 'Gemini' 
                    ? `<i class="fa-solid fa-wand-magic-sparkles"></i> EdiOne Gemini`
                    : `<i class="fa-brands fa-meta"></i> EdiOne Meta AI`; // Display Meta Icon badge safely
                header.style.color = activeEngineLabel === 'Gemini' ? '#4facfe' : '#0080ff';
            }
            if (body) body.textContent = newContent;
        }
    }

    function autoScrollBottom() {
        chatScroller.scrollTop = chatScroller.scrollHeight;
    }

    // --- 5. EVENT LISTENERS ACTIVATION MATRIX ---
    submitBtn.addEventListener('click', () => generateVideoContent());
    
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') generateVideoContent();
    });

    suggestCards.forEach(card => {
        card.addEventListener('click', () => {
            const quickText = card.getAttribute('data-prompt');
            generateVideoContent(quickText);
        });
    });
});
