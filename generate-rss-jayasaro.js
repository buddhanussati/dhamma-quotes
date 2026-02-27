const fs = require('fs');

// Use unique filenames so we don't overwrite the Thanissaro Bhikkhu feed
const HISTORY_FILE = 'history-jayasaro.json';
const RSS_FILE = 'rss-jayasaro.xml';
const CYCLE_FILE = 'cycle-state-jayasaro.json'; // New file to track the current cycle
const MAX_ITEMS = 10;

// 1. Read the JS file containing the Ajahn Jayasāro quotes
const fileContent = fs.readFileSync('jayasaro-quotes.js', 'utf8');
const match = fileContent.match(/const JayasaroQuotesData = `([\s\S]*?)`;/);
if (!match) {
    console.error("Could not find the Ajahn Jayasāro quotes data.");
    process.exit(1);
}

const htmlContent = match[1];
const allQuotes = htmlContent.split('<hr>').map(q => q.trim()).filter(q => q.length > 0);

// 2. Manage Cycle State to ensure unique quotes
let availableIndices = [];
if (fs.existsSync(CYCLE_FILE)) {
    try {
        availableIndices = JSON.parse(fs.readFileSync(CYCLE_FILE, 'utf8'));
    } catch (e) {
        availableIndices = [];
    }
}

// If the array is empty (first run or cycle complete), refill and shuffle it
if (availableIndices.length === 0) {
    console.log("Starting a new, freshly shuffled cycle of quotes!");
    availableIndices = allQuotes.map((_, index) => index);
    
    // Fisher-Yates shuffle algorithm
    for (let i = availableIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
    }
}

// Draw the next index from the pile and save the updated state
const selectedIndex = availableIndices.pop();
fs.writeFileSync(CYCLE_FILE, JSON.stringify(availableIndices, null, 2));

// 3. Select the unique quote
const randomQuote = allQuotes[selectedIndex];

// 4. Generate Title & Metadata for the new item
// Remove HTML tags to create a clean text preview for the title
let cleanText = randomQuote.replace(/<\/?[^>]+(>|$)/g, "").trim();
const words = cleanText.split(/\s+/);
const titleText = words.slice(0, 25).join(' ') + (words.length > 25 ? '…' : '');

const newItem = {
    title: titleText,
    content: randomQuote,
    pubDate: new Date().toUTCString(),
    guid: Date.now().toString()
};

// 5. Manage History (Load, Add, and Trim to 10)
let history = [];
if (fs.existsSync(HISTORY_FILE)) {
    try {
        history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (e) {
        history = [];
    }
}

// Add new quote to the beginning of the array
history.unshift(newItem);

// Keep only the most recent 10
history = history.slice(0, MAX_ITEMS);

// Save history back to file
fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

// 6. Build the RSS XML Items
const itemsXml = history.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>https://buddhanussati.github.io/dhamma-quotes</link>
      <description><![CDATA[
        ${item.content}
      ]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="false">${item.guid}</guid>
    </item>`).join('\n');

// 7. Build the Full RSS XML
const pubDate = new Date().toUTCString();
const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Ajahn Jayasāro Quotes</title>
    <link>https://buddhanussati.github.io/dhamma-quotes</link>
    <description>Dhamma quotes by Ajahn Jayasāro, updated every 6 hours</description>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <image>
      <url>https://buddhanussati.github.io/dhamma-quotes/favicon.png</url>
      <title>Ajahn Jayasāro Quotes</title>
      <link>https://buddhanussati.github.io/dhamma-quotes</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

fs.writeFileSync(RSS_FILE, rssXml);

console.log(`Generated RSS with ${history.length} items. Quotes left in cycle: ${availableIndices.length}. Latest: ${titleText}`);
