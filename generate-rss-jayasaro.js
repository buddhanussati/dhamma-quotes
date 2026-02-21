const fs = require('fs');

// Use unique filenames so we don't overwrite the Thanissaro Bhikkhu feed
const HISTORY_FILE = 'history-jayasaro.json';
const RSS_FILE = 'rss-jayasaro.xml';
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

// 2. Select a NEW random quote
const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];

// 3. Generate Title & Metadata for the new item
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
      <link>https://buddhanussati.github.io/dhamma-quotes/2</link>
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
    <title>Ajahn Jayasāro Quotes</title>
    <link>https://buddhanussati.github.io/dhamma-quotes/2</link>
    <description>Dhamma quotes by Ajahn Jayasāro, updated every 6 hours</description>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <image>
      <url>https://buddhanussati.github.io/dhamma-quotes/2/favicon.png</url>
      <title>Ajahn Jayasāro Quotes</title>
      <link>https://buddhanussati.github.io/dhamma-quotes/2</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

fs.writeFileSync(RSS_FILE, rssXml);
console.log(`Generated RSS with ${history.length} items. Latest: ${titleText}`);