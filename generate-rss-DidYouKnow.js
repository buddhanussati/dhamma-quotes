const fs = require('fs');

const HISTORY_FILE = 'history-DidYouKnow.json';
const RSS_FILE = 'DidYouKnow.xml';
const CYCLE_FILE = 'cycle-state-DidYouKnow.json';
const MAX_ITEMS = 50;
const QUOTES_PER_RUN = 5; // Updated to pick 5 quotes

// 1. Read the JS file containing the quotes
if (!fs.existsSync('DYK.js')) {
    console.error("DYK.js not found.");
    process.exit(1);
}

const fileContent = fs.readFileSync('DYK.js', 'utf8');
const match = fileContent.match(/const DidYouKnowData = `([\s\S]*?)`;/);
if (!match) {
    console.error("Could not find the data pattern in DYK.js.");
    process.exit(1);
}

const htmlContent = match[1];
const allQuotes = htmlContent.split('<hr>').map(q => q.trim()).filter(q => q.length > 0);

// 2. Manage Cycle State logic
let availableIndices = [];
if (fs.existsSync(CYCLE_FILE)) {
    try {
        availableIndices = JSON.parse(fs.readFileSync(CYCLE_FILE, 'utf8'));
    } catch (e) {
        availableIndices = [];
    }
}

function refillIndices() {
    console.log("Starting a new, freshly shuffled cycle of quotes!");
    let indices = allQuotes.map((_, index) => index);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
}

if (availableIndices.length === 0) {
    availableIndices = refillIndices();
}

// 3. Select 5 quotes
const selectedItems = [];
const now = Date.now();

for (let i = 0; i < QUOTES_PER_RUN; i++) {
    // If we run out mid-loop, refill immediately
    if (availableIndices.length === 0) {
        availableIndices = refillIndices();
    }
    
    const selectedIndex = availableIndices.pop();
    const randomQuote = allQuotes[selectedIndex];

    // Generate Title & Metadata
    let cleanText = randomQuote.replace(/<\/?[^>]+(>|$)/g, " ");
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ');
    const titleText = words.slice(0, 25).join(' ') + (words.length > 25 ? '…' : '');

    selectedItems.push({
        title: titleText,
        content: randomQuote,
        // Decrease pubDate slightly for each item to maintain order in readers
        pubDate: new Date(now - i * 1000).toUTCString(),
        guid: `${now}-${selectedIndex}`
    });
}

// Save updated cycle state
fs.writeFileSync(CYCLE_FILE, JSON.stringify(availableIndices, null, 2));

// 4. Manage History (Add the 5 new items and trim to 10)
let history = [];
if (fs.existsSync(HISTORY_FILE)) {
    try {
        history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (e) {
        history = [];
    }
}

// Add the batch of 5 to the top
history.unshift(...selectedItems);
history = history.slice(0, MAX_ITEMS);

fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

// 5. Build the RSS XML
const itemsXml = history.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>https://buddhanussati.github.io/dhamma-quotes/</link>
      <description><![CDATA[
        ${item.content}
      ]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="false">${item.guid}</guid>
    </item>`).join('\n');

const currentPubDate = new Date().toUTCString();
const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>DidYouKnow-SuttaEdition</title>
    <link>https://buddhanussati.github.io/dhamma-quotes/</link>
    <description>DidYouKnow-SuttaEdition</description>
    <lastBuildDate>${currentPubDate}</lastBuildDate>
    <image>
      <url>https://loicuaducphat.org/congcu/images/favicon6.ico</url>
      <title>DidYouKnow-SuttaEdition</title>
      <link>https://loicuaducphat.org/congcu/images/favicon6.ico</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

fs.writeFileSync(RSS_FILE, rssXml);

console.log(`Generated RSS with ${history.length} items. Quotes left in cycle: ${availableIndices.length}.`);