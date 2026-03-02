const fs = require('fs');

const HISTORY_FILE = 'history-suttavi.json';
const RSS_FILE = 'suttavi.xml';
const CYCLE_FILE = 'cycle-state-suttavi.json';
const MAX_ITEMS = 10;

// ==================== 0. LOAD IMAGES ====================
// Add your own image URLs here. It is best to host these on your own server (e.g., loicuaducphat.org/images/...)
const BUDDHIST_IMAGES = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/001_Dhammacakka%2C_7c%2C_Dwaravati_%2835252600795%29.jpg/500px-001_Dhammacakka%2C_7c%2C_Dwaravati_%2835252600795%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Gandhara_Buddha_%28tnm%29.jpeg/500px-Gandhara_Buddha_%28tnm%29.jpeg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Ajanta_Cave_Buddha.jpg/500px-Ajanta_Cave_Buddha.jpg",
    "https://budsas.net/ajt/ellora07.jpg",
    "https://budsas.net/sen/hoasen_tranh01.jpg",
	"https://budsas.net/sen/hoasen_tranh02.jpg",
	"https://budsas.net/sen/hoasen_tranh03.jpg",
	"https://budsas.net/sen/hoasen_tranh04.jpg",
	"https://budsas.net/sen/hoasen_tranh05.jpg",
	"https://budsas.net/sen/hoasen_tranh06.jpg",
	"https://budsas.net/sen/hoasen_tranh07.jpg",
	"https://budsas.net/sen/hoasen_tranh08.jpg",
	"https://budsas.net/sen/hoasen_tranh09.jpg",
	"https://budsas.net/sen/hoasen_tranh10.jpg",
	"https://budsas.net/sen/hoasen_tranh11.jpg",
	"https://budsas.net/sen/hoasen_tranh12.jpg",
	"https://budsas.net/sen/beautiful-big-lily-in-water.jpg",
	"https://budsas.net/sen/fragrant-waterlily.jpg",
	"https://budsas.net/senv/sen_vn001.jpg",
	"https://budsas.net/sen/big-pink-shaded-flower.jpg",	"https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/BUDDHA_-_HOLY_THREAD%2C_OIL_PAINTING_BY_RAJASEKHARAN.jpg/960px-BUDDHA_-_HOLY_THREAD%2C_OIL_PAINTING_BY_RAJASEKHARAN.jpg",
	"https://budsas.net/sen/water-lilly-pink-87e.jpg",
	"https://budsas.net/sen/water-lilly-7w.jpg",
	"https://budsas.net/sen/water-lily-4j.jpg",
	"https://budsas.net/sen/water-lily-9d.jpg",
	"https://budsas.net/sen/waterlily-94r.jpg",
	"https://budsas.net/sen/water-lily-bud.jpg",
	
];

// ==================== 1. LOAD QUOTES ====================
const { SuttaQuotesData } = require('./suttavi-quotes.js');

const allQuotes = SuttaQuotesData
    .map(item => ({
        text: (item && item.text ? item.text : '').trim(),
        ref:  (item && item.ref)  || '',
        url:  (item && item.url)  || ''
    }))
    .filter(q => q.text.length > 0);

console.log(`✅ Loaded ${allQuotes.length} sutta quotes successfully.`);

// ==================== 2. MANAGE CYCLE STATE ====================
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

// Pick a random image for this specific post
const randomImageUrl = BUDDHIST_IMAGES[Math.floor(Math.random() * BUDDHIST_IMAGES.length)];

const newItem = {
    title:   titleText,
    content: randomQuote,
    ref:     selectedQuote.ref,
    url:     selectedQuote.url,
    image:   randomImageUrl, // <-- Save the image URL in the item history
    pubDate: new Date().toUTCString(),
    guid:    Date.now().toString()
};

// ==================== 4. MANAGE HISTORY ====================
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

// ==================== 5. BUILD RSS XML ====================
const itemsXml = history.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.url || 'https://loicuaducphat.org/congcu/trichdan'}</link>
      <description><![CDATA[
        ${item.image ? `<img src="${item.image}" alt="Buddhist imagery" style="max-width: 100%; height: auto; margin-bottom: 15px;" /><br>` : ''}
        ${item.content}
        <br><br>
        <strong>Trích:</strong> ${item.ref}
        ${item.url ? `<br><a href="${item.url}">📖 Đọc kinh này</a>` : ''}
      ]]></description>
      ${item.image ? `<enclosure url="${item.image}" type="image/jpeg" length="0" />` : ''}
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="false">${item.guid}</guid>
    </item>`).join('\n');

const pubDate = new Date().toUTCString();
const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Trích Dẫn Kinh Điển Nikaya</title>
    <link>https://loicuaducphat.org/congcu/trichdan</link>
    <description>Trích Dẫn Kinh Điển Nikaya</description>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <image>
      <url>https://loicuaducphat.org/congcu/images/favicon6.ico</url>
      <title>Trích Dẫn Kinh Điển Nikaya</title>
      <link>https://loicuaducphat.org/congcu/images/favicon6.ico</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

fs.writeFileSync(RSS_FILE, rssXml);

console.log(`✅ RSS generated successfully!`);
console.log(`   • Items in feed     : ${history.length}`);
console.log(`   • Quotes left in cycle: ${availableIndices.length}`);
console.log(`   • Latest title      : ${titleText.substring(0, 80)}${titleText.length > 80 ? '...' : ''}`);
console.log(`   • Latest image      : ${randomImageUrl}`);