const fs = require('fs');

const HISTORY_FILE = 'history-jataka.json';
const RSS_FILE = 'jataka.xml';
const CYCLE_FILE = 'cycle-state-jataka.json';
const MAX_ITEMS = 10;

// 1. Read the JS file containing the Jataka Stories
const fileContent = fs.readFileSync('jataka-stories.js', 'utf8');
const match = fileContent.match(/const JatakaStoriesData = `([\s\S]*?)`;/);
if (!match) {
    console.error("Could not find the Jataka Stories data.");
    process.exit(1);
}

const htmlContent = match[1];
const allStories = htmlContent.split('<hr>').map(q => q.trim()).filter(q => q.length > 0);

// 2. Manage Cycle State to ensure unique Stories
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
    console.log("Starting a new, freshly shuffled cycle of stories!");
    availableIndices = allStories.map((_, index) => index);
    
    // Fisher-Yates shuffle algorithm
    for (let i = availableIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
    }
}

// Draw the next index from the pile and save the updated state
const selectedIndex = availableIndices.pop();
fs.writeFileSync(CYCLE_FILE, JSON.stringify(availableIndices, null, 2));

// 3. Select the unique Story
const randomStory = allStories[selectedIndex];

// === NEW: Extract Jataka number and source link from the story HTML ===
const numberMatch = randomStory.match(/#(\d+)/);
const jatakaNumber = numberMatch ? numberMatch[1] : 'Unknown';

const linkMatch = randomStory.match(/<link>(https?:\/\/[^\s<]+)<\/link>/);
const storyLink = linkMatch ? linkMatch[1] : 'https://thejatakatales.com';

// 4. Generate Title & Metadata for the new item
let cleanText = randomStory
    // Remove the entire <h3> block (we will build the title manually with the number)
    .replace(/<h3.*?>[\s\S]*?<\/h3>/gi, "")
    // Remove all other remaining HTML tags
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Replace multiple spaces/newlines with a single space
    .replace(/\s+/g, " ")
    .trim();

const words = cleanText.split(/\s+/);
const titleText = words.slice(0, 25).join(' ') + (words.length > 25 ? '…' : '');

// Title now follows the requested format: "Jataka 281: ..."
const title = `Jataka ${jatakaNumber}: ${titleText}`;

const newItem = {
    title: title,
    content: randomStory,
    pubDate: new Date().toUTCString(),
    guid: Date.now().toString(),
    link: storyLink   // ← store the real story link from <link> tag
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

// Add new Story to the beginning of the array
history.unshift(newItem);

// Keep only the most recent 10
history = history.slice(0, MAX_ITEMS);

// Save history back to file
fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

// 6. Build the RSS XML Items
const itemsXml = history.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link || 'https://thejatakatales.com'}</link>
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

console.log(`Generated RSS with ${history.length} items. Stories left in cycle: ${availableIndices.length}. Latest: ${title}`);