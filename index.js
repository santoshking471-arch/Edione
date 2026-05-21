// index.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SIDE DRAWER MENU NAVIGATION ENGINE (Real Action Added) ---
    const topMenu = document.getElementById('top-menu');
    const closeMenuDrawer = document.getElementById('close-menu-drawer');
    const sideMenuDrawer = document.getElementById('side-menu-drawer');
    const menuScreenOverlay = document.getElementById('menu-screen-overlay');

    // Menu Open karne ka logic
    if (topMenu && sideMenuDrawer && menuScreenOverlay) {
        topMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            sideMenuDrawer.classList.add('open');
            menuScreenOverlay.classList.add('visible');
            console.log("Side Drawer Menu Opened.");
        });
    }

    // Menu Close karne ka common function
    function closeDrawerSystem() {
        if (sideMenuDrawer && menuScreenOverlay) {
            sideMenuDrawer.classList.remove('open');
            menuScreenOverlay.classList.remove('visible');
            console.log("Side Drawer Menu Closed.");
        }
    }

    // X button aur background overlay par click karne se menu close hoga
    if (closeMenuDrawer) {
        closeMenuDrawer.addEventListener('click', closeDrawerSystem);
    }
    if (menuScreenOverlay) {
        menuScreenOverlay.addEventListener('click', closeDrawerSystem);
    }


    // --- 2. ACTUAL WORKING NAVIGATION FOR ACCENT BUTTONS ---
    const interactiveElements = document.querySelectorAll('.page-trigger');

    interactiveElements.forEach(element => {
        element.addEventListener('click', () => {
            const targetPage = element.getAttribute('data-target');
            if (targetPage) {
                console.log(`Navigating to: ${targetPage}`);
                window.location.href = targetPage; 
            }
        });
    });


    // --- 3. PROFILE UTILITY (Stays on context) ---
    const topProfile = document.getElementById('top-profile');

    if (topProfile) {
        topProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Opening account management system...");
            alert("Profile Settings Triggered (Fixed Action)");
        });
    }


    // --- 4. BOTTOM NAV TAB SYSTEM ---
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); 
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            console.log(`Tab switched to: ${item.id}`);
        });
    });
});
