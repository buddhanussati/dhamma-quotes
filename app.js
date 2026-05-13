document.addEventListener('DOMContentLoaded', () => {
    const quoteContainer = document.getElementById('quote-container');
    const newQuoteBtn = document.getElementById('new-quote-btn');
    const copyBtn = document.getElementById('copy-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const tabsContainer = document.getElementById('tabs-container');
    const rssLink = document.getElementById('rss-link');

    const feedFiles = {
        thanissaro: 'thanissaro.xml',
        jayasaro: 'jayasaro.xml',
        chah: 'ajahnchah.xml',
        panna: 'pannavaddho.xml',
		thate: 'ajahnThate.xml',
		funn: 'ajahnFunn.xml',
		DYK: 'DidYouKnow.xml',
    };

    const teachers = {
        thanissaro: { name: "Thanissaro Bhikkhu", getData: () => typeof thanissaroQuotesData !== 'undefined' ? thanissaroQuotesData : "", quotes: [], queue: [] },
        jayasaro: { name: "Ajahn Jayasaro", getData: () => typeof JayasaroQuotesData !== 'undefined' ? JayasaroQuotesData : "", quotes: [], queue: [] },
        chah: { name: "Ajahn Chah", getData: () => typeof AjahnChahQuotesData !== 'undefined' ? AjahnChahQuotesData : "", quotes: [], queue: [] },
        panna: { name: "Ajaan Paññāvaddho", getData: () => typeof PannavaddhoQuotesData !== 'undefined' ? PannavaddhoQuotesData : "", quotes: [], queue: [] },
		thate: { name: "Ajaan Thate", getData: () => typeof ajahnThateQuotes !== 'undefined' ? ajahnThateQuotes : "", quotes: [], queue: [] },
		funn: { name: "Ajaan Funn Ācāro", getData: () => typeof ajahnFunnQuotes !== 'undefined' ? ajahnFunnQuotes : "", quotes: [], queue: [] },
		DYK: { name: "#DidYouKnow", getData: () => typeof DYKQuotesData !== 'undefined' ? DYKQuotesData : "", quotes: [], queue: [] },

    };

    let currentTeacherKey = 'thanissaro';

    // Helper to shuffle an array (Fisher-Yates)
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // 1. Helper to save all queues to localStorage
const saveQueuesToStorage = () => {
    const dataToSave = {};
    for (const key in teachers) {
        dataToSave[key] = teachers[key].queue;
    }
    localStorage.setItem('dhamma_quote_queues', JSON.stringify(dataToSave));
};

// 2. Updated Initialize: Loads saved progress or starts fresh
const initializeQuotes = () => {
    const savedQueues = JSON.parse(localStorage.getItem('dhamma_quote_queues')) || {};
    
    for (const key in teachers) {
        const rawData = teachers[key].getData();
        teachers[key].quotes = rawData.split('<hr>')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        // Load saved queue if it exists and matches the current quote count
        if (savedQueues[key] && savedQueues[key].length > 0) {
            teachers[key].queue = savedQueues[key];
        } else {
            refreshQueue(key);
        }
    }
};

// 3. Updated Refresh: Shuffles and then saves
const refreshQueue = (key) => {
    teachers[key].queue = shuffle([...Array(teachers[key].quotes.length).keys()]);
    saveQueuesToStorage();
};

// 4. Updated Display: Popping a quote now saves the new state
const displayRandomQuote = () => {
    let teacher = teachers[currentTeacherKey];
    if (teacher.quotes.length === 0) return;

    if (teacher.queue.length === 0) {
        refreshQueue(currentTeacherKey);
    }

    const quoteIndex = teacher.queue.pop();
    saveQueuesToStorage(); // Save the fact that we've used this quote

    quoteContainer.style.opacity = 0;
    setTimeout(() => {
        quoteContainer.innerHTML = teacher.quotes[quoteIndex];
        quoteContainer.style.opacity = 1;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
};

    const copyQuote = () => {
        const text = quoteContainer.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "Copied!";
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
        });
    };

    // Tab Rendering
    const renderTabs = () => {
        tabsContainer.innerHTML = '';
        for (const key in teachers) {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${key === currentTeacherKey ? 'active' : ''}`;
            btn.textContent = teachers[key].name;
            btn.addEventListener('click', () => {
                currentTeacherKey = key;
                if (rssLink) rssLink.href = feedFiles[key];
                renderTabs();
                displayRandomQuote();
            });
            tabsContainer.appendChild(btn);
        }
    };

    // Theme Logic
    const applyTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    // Event Listeners
    themeToggleBtn.addEventListener('click', () => {
        const activeTheme = document.body.getAttribute('data-theme');
        applyTheme(activeTheme === 'light' ? 'dark' : 'light');
    });

    newQuoteBtn.addEventListener('click', displayRandomQuote);
    quoteContainer.addEventListener('click', displayRandomQuote);
    copyBtn.addEventListener('click', copyQuote);

    initializeQuotes();
    renderTabs();
    displayRandomQuote();
});