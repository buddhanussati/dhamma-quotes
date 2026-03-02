const fs = require('fs');

const HISTORY_FILE = 'history-suttavi.json';
const RSS_FILE = 'suttavi.xml';
const CYCLE_FILE = 'cycle-state-suttavi.json';
const MAX_ITEMS = 10;

// ==================== 1. LOAD QUOTES (NEW FORMAT) ====================
// This works with your new suttavi-quotes.js (array of objects)
const { SuttaQuotesData } = require('./suttavi-quotes.js');

const allQuotes = SuttaQuotesData
    .map(item => ({
        text: (item && item.text ? item.text : '').trim(),
        ref:  (item && item.ref)  || '',
        url:  (item && item.url)  || ''
    }))
    .filter(q => q.text.length > 0);

console.log(`✅ Loaded ${allQuotes.length} sutta quotes successfully.`);

// ==================== 2. MANAGE CYCLE STATE (guaranteed unique until cycle repeats) ====================
let availableIndices = [];
if (fs.existsSync(CYCLE_FILE)) {
    try {
        availableIndices = JSON.parse(fs.readFileSync(CYCLE_FILE, 'utf8'));
    } catch (e) {
        availableIndices = [];
    }
}

// Refill & shuffle when cycle is exhausted
if (availableIndices.length === 0) {
    console.log("🔄 Starting a new, freshly shuffled cycle of all quotes!");
    availableIndices = allQuotes.map((_, index) => index);
    
    // Fisher-Yates shuffle
    for (let i = availableIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
    }
}

// Pick next quote and save remaining cycle
const selectedIndex = availableIndices.pop();
fs.writeFileSync(CYCLE_FILE, JSON.stringify(availableIndices, null, 2));

const selectedQuote = allQuotes[selectedIndex];
const randomQuote = selectedQuote.text;

// ==================== 3. GENERATE TITLE & METADATA ====================
let cleanText = randomQuote.replace(/<\/?[^>]+(>|$)/g, " ");
cleanText = cleanText.replace(/\s+/g, ' ').trim();
const words = cleanText.split(' ');
const titleText = words.slice(0, 25).join(' ') + (words.length > 25 ? '…' : '');

const newItem = {
    title:   titleText,
    content: randomQuote,
    ref:     selectedQuote.ref,
    url:     selectedQuote.url,
    pubDate: new Date().toUTCString(),
    guid:    Date.now().toString()
};

// ==================== 4. MANAGE HISTORY (last 10 items) ====================
let history = [];
if (fs.existsSync(HISTORY_FILE)) {
    try {
        history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (e) {
        history = [];
    }
}

history.unshift(newItem);           // newest on top
history = history.slice(0, MAX_ITEMS);

fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

// ==================== 5. BUILD RSS XML (with source links!) ====================
const itemsXml = history.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.url || 'https://buddhanussati.github.io/dhamma-quotes/1/home'}</link>
      <description><![CDATA[
        ${item.content}
        <br><br>
        <strong>Nguồn:</strong> ${item.ref}
        ${item.url ? `<br><a href="${item.url}">📖 Đọc đầy đủ</a>` : ''}
      ]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="false">${item.guid}</guid>
    </item>`).join('\n');

const pubDate = new Date().toUTCString();
const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Trích Dẫn Kinh Điển Nikaya</title>
    <link>https://buddhanussati.github.io/dhamma-quotes/1/home</link>
    <description>Trích Dẫn Kinh Điển Nikaya - Daily Sutta Quotes</description>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <image>
      <url>https://buddhanussati.github.io/dhamma-quotes/favicon2.png</url>
      <title>Trích Dẫn Kinh Điển Nikaya</title>
      <link>https://buddhanussati.github.io/dhamma-quotes/favicon2.png</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

fs.writeFileSync(RSS_FILE, rssXml);

console.log(`✅ RSS generated successfully!`);
console.log(`   • Items in feed     : ${history.length}`);
console.log(`   • Quotes left in cycle: ${availableIndices.length}`);
console.log(`   • Latest title      : ${titleText.substring(0, 80)}${titleText.length > 80 ? '...' : ''}`);