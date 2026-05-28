// --- 3. VIDEO GENERATION ENGINE CORE CONTROLLER (FIXED) ---
async function startVideoGenerationEngine(forcedText = null) {
    const userPrompt = forcedText ? forcedText : inputField.value.trim();
    if (!userPrompt) return;

    if (welcomeArea) welcomeArea.style.display = 'none';

    appendBubble(userPrompt, 'user');
    if(!forcedText) inputField.value = ""; 
    autoScrollBottom();

    const aiBubbleId = 'ai-' + Date.now();
    appendBubble("EdiOne is compiling 30s cinematic sequence...", 'ai', aiBubbleId, true);
    autoScrollBottom();

    // Promp mein "30 seconds" ka command add kar diya hai
    const structuralPrompt = `Act as a Professional Video Producer. For the topic "${userPrompt}", write a premium 30-second cinematic video script description. Keep it descriptive for a 30s visual timeline.`;

    try {
        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: structuralPrompt }] }] })
        });

        const data = await response.json();
        let generatedSceneText = data.candidates[0].content.parts[0].text.trim();

        if (generatedSceneText) {
            updateAIBubble(aiBubbleId, `🎬 [Script Generated]: ${generatedSceneText}\n\n⏳ Sending 30s timeline to Shotstack...`);
            await triggerShotstackRender(generatedSceneText, aiBubbleId);
        }
    } catch (error) {
        alert(`Execution Failure: ${error.message}`);
    }
}

// --- 4. UPGRADED 30-SECOND SHOTSTACK PIPELINE ---
async function triggerShotstackRender(sceneDescriptionText, aiBubbleId) {
    // 30 seconds ki duration ke liye lambi footage
    const stockVideoUrl = "https://s3-ap-southeast-2.amazonaws.com/shotstack-assets/footage/road.mp4";

    const shotstackTimelineJSON = {
        timeline: {
            background: "#000000",
            tracks: [
                {
                    // Track 1: Background Video (30s)
                    clips: [{ 
                        asset: { type: "video", src: stockVideoUrl }, 
                        start: 0, 
                        length: 30, // FIX: 5 se 30 kiya
                        trim: 0 
                    }]
                },
                {
                    // Track 2: Title Overlay (30s)
                    clips: [{ 
                        asset: { type: "title", text: sceneDescriptionText, style: "minimal", size: "small", color: "#ffffff" }, 
                        start: 0, 
                        length: 30 
                    }]
                }
            ]
        },
        output: { format: "mp4", resolution: "hd" }
    };

    try {
        const response = await fetch(SHOTSTACK_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': SHOTSTACK_API_KEY },
            body: JSON.stringify(shotstackTimelineJSON)
        });

        const renderResult = await response.json();
        if (renderResult.response && renderResult.response.id) {
            checkVideoStatusUntilDone(renderResult.response.id, aiBubbleId, sceneDescriptionText);
        }
    } catch (error) {
        updateAIBubble(aiBubbleId, "❌ Shotstack Server Connection Refused.");
    }
}
