// index.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ACTUAL WORKING NAVIGATION FOR ACCENT BUTTONS ---
    // Yeh script har us element ko listen karegi jisme '.page-trigger' class hai
    const interactiveElements = document.querySelectorAll('.page-trigger');

    interactiveElements.forEach(element => {
        element.addEventListener('click', () => {
            // Element ke 'data-target' attribute se file ka naam fetch karega
            const targetPage = element.getAttribute('data-target');
            
            if (targetPage) {
                console.log(`Navigating to: ${targetPage}`);
                
                // Real redirection triggering
                window.location.href = targetPage; 
            }
        });
    });


    // --- 2. FIXED MENU & CONSOLE UTILITIES (No page reload) ---
    const topMenu = document.getElementById('top-menu');
    const topProfile = document.getElementById('top-profile');

    if (topMenu) {
        topMenu.addEventListener('click', (e) => {
            e.stopPropagation(); // Stops parent container click triggers
            console.log("Fixed Side Drawer Menu Opened.");
            alert("Menu Triggered (Fixed Action)");
        });
    }

    if (topProfile) {
        topProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Opening account management system...");
            alert("Profile Settings Triggered (Fixed Action)");
        });
    }


    // --- 3. BOTTOM NAV TAB SYSTEM (Stays on same dashboard context) ---
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents page reload trigger
            
            // Remove active status from others
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active status to current selection
            item.classList.add('active');
            
            console.log(`Tab switched to: ${item.id}`);
        });
    });
});
