document.addEventListener('DOMContentLoaded', () => {
    const quoteContainer = document.getElementById('quote-container');
    const newQuoteBtn = document.getElementById('new-quote-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // 1. Setup Dark/Light Mode
    const currentTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.body.setAttribute('data-theme', currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        let theme = document.body.getAttribute('data-theme');
        theme = theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });

    // 2. Parse Quotes from the global variable defined in thanissaro_quotes.js
    let quotesArray = [];
    if (typeof thanissaroQuotesData !== 'undefined') {
        // Split the giant string using the <hr> tag
        quotesArray = thanissaroQuotesData.split('<hr>')
            .map(quote => quote.trim())
            .filter(quote => quote.length > 0);
    } else {
        quoteContainer.innerHTML = '<p>Error: Could not load quotes. Did you wrap them in the `thanissaroQuotesData` variable?</p>';
    }

    // 3. Display Random Quote
    const displayRandomQuote = () => {
        if (quotesArray.length === 0) return;
        const randomIndex = Math.floor(Math.random() * quotesArray.length);
        
        // Add fade-in effect
        quoteContainer.style.opacity = 0;
        setTimeout(() => {
            quoteContainer.innerHTML = quotesArray[randomIndex];
            quoteContainer.style.opacity = 1;
        }, 150);
    };

    newQuoteBtn.addEventListener('click', displayRandomQuote);

    // Show the first quote on load
    displayRandomQuote();
});