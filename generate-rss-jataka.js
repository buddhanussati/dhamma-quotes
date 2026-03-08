const fs = require('fs');

const HISTORY_FILE = 'history-jataka.json';
const RSS_FILE = 'jataka.xml';
const CYCLE_FILE = 'cycle-state-jataka.json';
const MAX_ITEMS = 10;

// 1. Read the JS file
const fileContent = fs.readFileSync('jataka-stories.js', 'utf8');
const match = fileContent.match(/const JatakaStoriesData = `([\s\S]*?)`;/);
if (!match) {
    console.error("Could not find the Jataka Stories data.");
    process.exit(1);
}

const htmlContent = match[1];
const allStories = htmlContent.split('<hr>').map(q => q.trim()).filter(q => q.length > 0);

// 2. Cycle state
let availableIndices = [];
if (fs.existsSync(CYCLE_FILE)) {
    try { availableIndices = JSON.parse(fs.readFileSync(CYCLE_FILE, 'utf8')); } catch(e) {}
}
if (availableIndices.length === 0) {
    console.log("Starting a new, freshly shuffled cycle of stories!");
    availableIndices = allStories.map((_, i) => i);
    for (let i = availableIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
    }
}
const selectedIndex = availableIndices.pop();
fs.writeFileSync(CYCLE_FILE, JSON.stringify(availableIndices, null, 2));

// 3. Select story
const randomStory = allStories[selectedIndex];

// === EXTRACT NUMBER AND REAL LINK ===
const numberMatch = randomStory.match(/#(\d+)/);
const jatakaNumber = numberMatch ? numberMatch[1] : 'Unknown';

const linkMatch = randomStory.match(/<link>(https?:\/\/[^\s<]+)<\/link>/);
const storyLink = linkMatch ? linkMatch[1] : 'https://thejatakatales.com';

// === FIXED: Remove <link> tag ONCE and use the clean version everywhere ===
const storyWithoutLink = randomStory
    .replace(/<link>https?:\/\/[^\s<]+<\/link>/gi, "");   // ← removes the URL completely

const storyForCleaning = storyWithoutLink
    .replace(/<h3.*?>[\s\S]*?<\/h3>/gi, "");

// 4. Generate clean title
let cleanText = storyForCleaning
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\s+/g, " ")
    .trim();

const words = cleanText.split(/\s+/);
const titleText = words.slice(0, 25).join(' ') + (words.length > 25 ? '…' : '');

const title = `Jataka ${jatakaNumber}: ${titleText}`;

const newItem = {
    title: title,
    content: storyWithoutLink,          // ← NOW WITHOUT <link> tag
    pubDate: new Date().toUTCString(),
    guid: Date.now().toString(),
    link: storyLink
};

// 5–7. History + RSS generation (unchanged)
let history = [];
if (fs.existsSync(HISTORY_FILE)) {
    try { history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch(e) {}
}
history.unshift(newItem);
history = history.slice(0, MAX_ITEMS);
fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

const itemsXml = history.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <description><![CDATA[${item.content}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="false">${item.guid}</guid>
    </item>`).join('\n');

const pubDate = new Date().toUTCString();
const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Daily Jataka Tales</title>
    <link>https://thejatakatales.com</link>
    <description>Daily Jataka Tales</description>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <image>
      <url>https://thejatakatales.com/wp-content/uploads/2018/07/jataka_favicon-150x150.jpg</url>
      <title>Daily Jataka Tales</title>
      <link>https://thejatakatales.com</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

fs.writeFileSync(RSS_FILE, rssXml);

console.log(`✅ Generated RSS — Latest: ${title}`);