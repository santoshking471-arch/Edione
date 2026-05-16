// script.js

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Grid Tools Buttons Click Logic
    const gridButtons = document.querySelectorAll('.grid-btn');
    
    gridButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Button text nikalne ke liye
            const toolName = this.querySelector('span:last-child').textContent;
            
            console.log(`${toolName} tool selected.`);
            
            // Aap yahan apna action perform kar sakte hain, jaise page change ya popup
            // Example: 
            // openToolPage(toolName);
        });
    });

    // 2. Note Section Items Click Logic
    const noteItems = document.querySelectorAll('.note-item');
    
    noteItems.forEach(item => {
        item.addEventListener('click', () => {
            const featureName = item.querySelector('h3').textContent;
            console.log(`Navigating to feature: ${featureName}`);
        });
    });

    // 3. Upgrade Pro Card Click Logic
    const upgradeCard = document.querySelector('.upgrade-section');
    if (upgradeCard) {
        upgradeCard.addEventListener('click', () => {
            console.log('Opening Subscription Payment Gateway...');
            // window.location.href = '/checkout';
        });
    }

    // 4. Top Header & Bottom Navigation Bar Controls
    const menuBtn = document.querySelector('.menu-btn');
    const profileBtn = document.querySelector('.profile-avatar');
    const homeBtn = document.querySelector('.nav-home');
    const backBtn = document.querySelector('.fa-chevron-left');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            console.log('Sidebar Menu Opened');
        });
    }

    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            console.log('Opening Profile Settings...');
        });
    }

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            console.log('Navigating to Home Screen');
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            console.log('Going back to previous screen');
            // window.history.back();
        });
    }
});
