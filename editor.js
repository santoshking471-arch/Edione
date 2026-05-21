// editor.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CORE AI & VIDEO RENDERING ENGINE CONFIGURATION ---
    // Aapki real Base64 Key yahan perfectly placed hai
    const ENCODED_GEMINI_KEY = "QUl6YVN5QXNoZ0k2WGswNThDa0xDMVhpTExDd3FiamwtR3BwRURR"; 
    
    let GEMINI_API_KEY = "";
    try {
        // Base64 string ko automatically decode karega
        GEMINI_API_KEY = atob(ENCODED_GEMINI_KEY.trim());
    } catch(e) {
        alert(`Base64 Key Decode Fail Error:\n${e.name} - ${e.message}`);
    }

    // Upgraded standard model endpoint for high reliability
    const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // Shotstack Real API Configuration (Sandbox Connected)
    const SHOTSTACK_API_KEY = "KZbTdfJCoiTWXybILYfSqQT25zJDiPYucmUNiIHB"; 
    const SHOTSTACK_ENDPOINT = "https://api.shotstack.io/edit/stage/render";

    const submitBtn = document.getElementById('submit-prompt');
    const inputField = document.getElementById('user-query');
    const welcomeArea = document.getElementById('welcome-area');
    const chatOutputSpace = document.getElementById('chat-output-space');
    const chatScroller = document.getElementById('chat-scroller');
    const suggestCards = document.querySelectorAll('.suggest-card');
    const themeToggle = document.getElementById('theme-toggle');

    // --- 2. THEME SWITCHER FUNCTIONALITY ---
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-theme');
            document.body.classList.toggle('light-theme', !isDark);
            themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        });
    }

    // --- 3. VIDEO GENERATION ENGINE CORE CONTROLLER ---
    async function startVideoGenerationEngine(forcedText = null) {
        const userPrompt = forcedText ? forcedText : inputField.value.trim();
        if (!userPrompt) return;

        if (welcomeArea) welcomeArea.style.display = 'none';

        // 1. User ka chat bubble UI par render karo
        appendBubble(userPrompt, 'user');
        if(!forcedText) inputField.value = ""; 
        autoScrollBottom();

        // 2. Dynamic loader loader setup
        const aiBubbleId = 'ai-' + Date.now();
        appendBubble("EdiOne is processing video elements...", 'ai', aiBubbleId, true);
        autoScrollBottom();

        // System prompt framework taaki Gemini direct premium script return kare
        const structuralPrompt = `Act as an Expert Video Producer. For the topic "${userPrompt}", write a 5-second cinematic description text for a premium background clip. Keep the description direct and inside 20 words.`;

        // 3. Trigger Gemini Response Chain
        try {
            const response = await fetch(GEMINI_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: structuralPrompt }] }]
                })
            });

            const data = await response.json();
            
            // Catch Google API Level errors (Jaise Invalid Key / Quota Over)
            if (data.error) {
                alert(`Google Server Error Response!\nCode: ${data.error.code}\nMessage: ${data.error.message}`);
                updateAIBubble(aiBubbleId, `❌ API Error: ${data.error.message}`);
                return;
            }

            // Safe parsing logic to check different types of API return packages
            let generatedSceneText = "";
            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                generatedSceneText = data.candidates[0].content.parts[0].text.trim();
            }

            if (generatedSceneText) {
                // Screen layout par generated script update karo
                updateAIBubble(aiBubbleId, `🎬 [Script Generated]: ${generatedSceneText}\n\n⏳ Sending framework to Shotstack engine for cloud rendering...`);
                autoScrollBottom();

                // 4. Trigger Shotstack Render Pipeline
                await triggerShotstackRender(generatedSceneText, aiBubbleId);
            } else {
                // Agar bina error ke khali response aata hai toh fallback box alert dikhao
                alert(`Empty Data Alert: Could not locate text field inside response content tree.\nRaw data: ${JSON.stringify(data)}`);
                updateAIBubble(aiBubbleId, `⚠️ Server Empty Response: Raw object structured mismatch.`);
            }

        } catch (error) {
            // JavaScript network block or code crash alert
            alert(`Network or Execution Failure Exception!\nError Name: ${error.name}\nError Message: ${error.message}`);
            console.error(error);
            updateAIBubble(aiBubbleId, `Network Block: ${error.name} - ${error.message}`);
        }
        
        autoScrollBottom();
    }

    // --- 4. SHOTSTACK REAL CLOUD RENDERING PIPELINE ---
    async function triggerShotstackRender(sceneDescriptionText, aiBubbleId) {
        const stockVideoUrl = "https://s3-ap-southeast-2.amazonaws.com/shotstack-assets/footage/earth.mp4";

        const shotstackTimelineJSON = {
            timeline: {
                tracks: [
                    {
                        clips: [
                            {
                                asset: {
                                    type: "video",
                                    src: stockVideoUrl
                                },
                                start: 0,
                                length: 5
                            },
                            {
                                asset: {
                                    type: "title",
                                    text: sceneDescriptionText,
                                    style: "minimal"
                                },
                                start: 0,
                                length: 5
                            }
                        ]
                    }
                ]
            },
            output: {
                format: "mp4",
                resolution: "hd"
            }
        };

        try {
            const response = await fetch(SHOTSTACK_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': SHOTSTACK_API_KEY
                },
                body: JSON.stringify(shotstackTimelineJSON)
            });

            const renderResult = await response.json();
            
            if (renderResult.response && renderResult.response.id) {
                const renderId = renderResult.response.id;
                updateAIBubble(aiBubbleId, `🎬 [Script]: ${sceneDescriptionText}\n\n✅ Video Render Queued Successfully!\n\nRender ID: ${renderId}\n\nShotstack sandbox is compiling assets. Check your Shotstack dashboard to preview the output file.`);
            } else {
                alert(`Shotstack Logic Warning: Request accepted but output structure is missing ID parameter.\nResponse: ${JSON.stringify(renderResult)}`);
                updateAIBubble(aiBubbleId, "❌ Shotstack Error: Timeline verification failed in sandbox container.");
            }
        } catch (error) {
            alert(`Shotstack Cloud Crash Exception!\nError Name: ${error.name}\nError Message: ${error.message}`);
            console.error("Shotstack Error:", error);
            updateAIBubble(aiBubbleId, "❌ Failed to connect to Shotstack rendering cloud node.");
        }
        autoScrollBottom();
    }

    // --- 5. RUN-TIME UI DOM GENERATOR UTILITIES ---
    function appendBubble(content, sender, uniqueId = null, isLoading = false) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;
        if (uniqueId) bubble.id = uniqueId;

        if (sender === 'user') {
            bubble.textContent = content;
        } else {
            bubble.innerHTML = `
                <div class="ai-header-node">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> EdiOne Engine
                </div>
                <div class="ai-content-body" style="white-space: pre-wrap;">${isLoading ? '<span class="loading-pulse">Compiling Video Scripts & Assets...</span>' : content}</div>
            `;
        }
        chatOutputSpace.appendChild(bubble);
    }

    function updateAIBubble(id, newContent) {
        const targetBubble = document.getElementById(id);
        if (targetBubble) {
            const body = targetBubble.querySelector('.ai-content-body');
            if (body) {
                // innerHTML alignment handling support with break line injection safely
                body.innerHTML = newContent.replace(/\n/g, '<br>');
            }
        }
    }

    function autoScrollBottom() {
        if (chatScroller) chatScroller.scrollTop = chatScroller.scrollHeight;
    }

    // --- 6. EVENT LISTENERS ACTIVATION MATRIX ---
    if (submitBtn) submitBtn.addEventListener('click', () => startVideoGenerationEngine());
    
    if (inputField) {
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') startVideoGenerationEngine();
        });
    }

    suggestCards.forEach(card => {
        card.addEventListener('click', () => {
            const quickText = card.getAttribute('data-prompt');
            startVideoGenerationEngine(quickText);
        });
    });
});
