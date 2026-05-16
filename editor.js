/* editor.js */

document.addEventListener('DOMContentLoaded', () => {
    // Elements Selectors
    const promptInput = document.querySelector('.prompt-input');
    const sendBtn = document.querySelector('.send-btn');
    const canvasPlaceholder = document.querySelector('.canvas-placeholder');
    const editorCanvas = document.querySelector('.editor-canvas');
    const toolBadges = document.querySelectorAll('.badge');

    // 1. Tool Badges Tap Handler (Quick Prompt Suggestion)
    toolBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            const toolName = badge.textContent.trim();
            // Input bar mein automatic text set ho jayega
            promptInput.value = `Using EdiOne Intelligence to: ${toolName}...`;
            promptInput.focus();
        });
    });

    // 2. Core AI Processing Function
    function processAIPrompt() {
        const userPrompt = promptInput.value.trim();

        if (userPrompt === "") {
            // Agar input khali hai toh shake animation effect
            promptInput.style.border = "1px solid #e53e3e";
            setTimeout(() => promptInput.style.border = "none", 500);
            return;
        }

        // Canvas UI ko "AI Loading" state mein badlein (Gemini Style)
        canvasPlaceholder.innerHTML = `
            <i class="fa-solid fa-sparkles logo-sparkle" style="font-size: 50px; color: #00f2fe; animation: sparklePulse 1.5s infinite;"></i>
            <h3 style="margin-top: 15px; font-weight: 600;">EdiOne is thinking...</h3>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 5px; max-width: 250px;">
                "${userPrompt}" is being compiled by AI Engine.
            </p>
        `;

        // Input bar ko temporary disable karein jab tak AI process ho raha hai
        promptInput.value = "";
        promptInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.style.opacity = "0.5";

        // Mock AI Server Response Timeout (Simulating Gemini API)
        setTimeout(() => {
            // Processing khatam hone ke baad UI response status
            canvasPlaceholder.innerHTML = `
                <i class="fa-solid fa-circle-check" style="font-size: 56px; color: #00ca9d;"></i>
                <h3 style="margin-top: 15px; font-weight: 600; color: #ffffff;">Task Completed!</h3>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 5px; max-width: 240px;">
                    AI Editor successfully applied changes to your workspace canvas.
                </p>
            `;

            // Reset Input Controls
            promptInput.disabled = false;
            sendBtn.disabled = false;
            sendBtn.style.opacity = "1";
        }, 3000); // 3 seconds ka loading time
    }

    // 3. Click Event Trigger
    sendBtn.addEventListener('click', processAIPrompt);

    // 4. Keyboard 'Enter' Key Support for Android/Desktop Input
    promptInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            processAIPrompt();
        }
    });
});

