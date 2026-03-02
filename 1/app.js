document.addEventListener('DOMContentLoaded', () => {
    const quoteContainer = document.getElementById('quote-container');
    const newQuoteBtn = document.getElementById('new-quote-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const tabsContainer = document.getElementById('tabs-container');
    const rssLink = document.getElementById('rss-link'); // Added for RSS

    // 2. RSS Mapping
    const feedFiles = {
        thanissaro: 'thanissaro.xml',
        jayasaro: 'jayasaro.xml',
		chah: 'ajahnchah.xml',
		panna: 'pannavaddho.xml'
    };
    // 1. Theme Persistence
    const applyTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const activeTheme = document.body.getAttribute('data-theme');
        applyTheme(activeTheme === 'light' ? 'dark' : 'light');
    });

    // 2. Teacher Configuration
    const teachers = {
        thanissaro: {
            name: "Thanissaro Bhikkhu",
            // Reference the variable name in thanissaro-quotes.js
            getData: () => typeof thanissaroQuotesData !== 'undefined' ? thanissaroQuotesData : "",
            quotes: []
        },
        jayasaro: {
            name: "Ajahn Jayasaro",
            // Reference the variable name in jayasaro-quotes.js
            getData: () => typeof JayasaroQuotesData !== 'undefined' ? JayasaroQuotesData : "",
            quotes: []
        },
		chah: {
            name: "Ajahn Chah",
            getData: () => typeof AjahnChahQuotesData !== 'undefined' ? AjahnChahQuotesData : "",
            quotes: []
        },
		panna: {
            name: "Ajaan Paññāvaddho",
            getData: () => typeof PannavaddhoQuotesData !== 'undefined' ? PannavaddhoQuotesData : "",
            quotes: []
        },
    };

    let currentTeacherKey = 'thanissaro';

    // 3. Parse Data
    const initializeQuotes = () => {
        for (const key in teachers) {
            const rawData = teachers[key].getData();
            teachers[key].quotes = rawData.split('<hr>')
                .map(q => q.trim())
                .filter(q => q.length > 0);
        }
    };

    // 4. Tab Rendering
    const renderTabs = () => {
        tabsContainer.innerHTML = '';
        for (const key in teachers) {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${key === currentTeacherKey ? 'active' : ''}`;
            btn.textContent = teachers[key].name;
            
            btn.addEventListener('click', () => {
                currentTeacherKey = key;
                
                // Update the RSS link here!
                if (rssLink) {
                    rssLink.href = feedFiles[key];
                }
                
                renderTabs();
                displayRandomQuote();
            });
            
            tabsContainer.appendChild(btn);
        }
    };
  
  
    // 5. Display & Smooth Transition
    const displayRandomQuote = () => {
        const pool = teachers[currentTeacherKey].quotes;
        if (pool.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * pool.length);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Fade out
        quoteContainer.style.opacity = 0;
        
        setTimeout(() => {
            quoteContainer.innerHTML = pool[randomIndex];
            // Fade in
            quoteContainer.style.opacity = 1;
        }, 400); // 400ms matches the CSS transition
    };

    initializeQuotes();
    renderTabs();
    displayRandomQuote();

    newQuoteBtn.addEventListener('click', displayRandomQuote);
});

// 1. Add this mapping at the top of your script or inside the DOMContentLoaded
const feedFiles = {
    thanissaro: 'thanissaro.xml',
    jayasaro: 'jayasaro.xml',
	chah: 'ajahnchah.xml',
	panna: 'pannavaddho.xml',
};

// 2. Update the RSS link inside your tab click handler
const rssLink = document.getElementById('rss-link');

// Inside your tab button click listener:
btn.addEventListener('click', () => {
    currentTeacherKey = key;
    
    // Update the RSS link to match the current teacher
    rssLink.href = feedFiles[key];
    
    renderTabs(); 
    displayRandomQuote();
});