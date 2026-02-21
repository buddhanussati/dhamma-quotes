const fs = require('fs');

const HISTORY_FILE = 'history.json';
const RSS_FILE = 'rss.xml';
const MAX_ITEMS = 10;

// 1. Read the JS file containing the quotes
const fileContent = fs.readFileSync('thanissaro-quotes.js', 'utf8');
const match = fileContent.match(/const thanissaroQuotesData = `([\s\S]*?)`;/);
if (!match) {
    console.error("Could not find the quotes data.");
    process.exit(1);
}

const htmlContent = match[1];
const allQuotes = htmlContent.split('<hr>').map(q => q.trim()).filter(q => q.length > 0);

// 2. Select a NEW random quote
const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];

// 3. Generate Title & Metadata for the new item
let cleanText = randomQuote.replace(/<\/?[^>]+(>|$)/g, " ");
cleanText = cleanText.replace(/\s+/g, ' ').trim();
const words = cleanText.split(' ');
const titleText = words.slice(0, 25).join(' ') + (words.length > 25 ? '…' : '');

const newItem = {
    title: titleText,
    content: randomQuote,
    pubDate: new Date().toUTCString(),
    guid: Date.now().toString()
};

// 4. Manage History (Load, Add, and Trim to 10)
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

// 5. Build the RSS XML Items
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

// 6. Build the Full RSS XML
const pubDate = new Date().toUTCString();
const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Thanissaro Bhikkhu Quotes</title>
    <link>https://buddhanussati.github.io/dhamma-quotes/</link>
    <description>Dhamma quotes by Thanissaro Bhikkhu, updated every 6 hours</description>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <image>
      <url>https://buddhanussati.github.io/dhamma-quotes/favicon.png</url>
      <title>Thanissaro Bhikkhu Quotes</title>
      <link>https://buddhanussati.github.io/dhamma-quotes/</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

fs.writeFileSync(RSS_FILE, rssXml);
console.log(`Generated RSS with ${history.length} items. Latest: ${titleText}`);