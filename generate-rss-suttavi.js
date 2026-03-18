const fs = require('fs');

const HISTORY_FILE = 'history-suttavi.json';
const RSS_FILE = 'suttavi.xml';
const CYCLE_FILE = 'cycle-state-suttavi.json';
const MAX_ITEMS = 10;

// ==================== 0. LOAD IMAGES ====================
// Add your own image URLs here. It is best to host these on your own server (e.g., loicuaducphat.org/images/...)
const BUDDHIST_IMAGES = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Lotus_flower_%28978659%29.jpg/960px-Lotus_flower_%28978659%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Sacred_Lotus_in_a_Pond_2.jpg/960px-Sacred_Lotus_in_a_Pond_2.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Nelumbo_nucifera_%289152625486%29.jpg/960px-Nelumbo_nucifera_%289152625486%29.jpg",
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
	"https://budsas.net/sen/fragrant-waterlily.jpg",
	"https://budsas.net/senv/sen_vn001.jpg",
	"https://image.giacngo.vn/w770/userimages/2015/03/24/12/tu%20van.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Painting_Lotus_Art.jpg/960px-Painting_Lotus_Art.jpg",	"https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Nelumbo_nucifera_%289150136377%29.jpg/960px-Nelumbo_nucifera_%289150136377%29.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Sacred_Lotus_in_a_Pond.jpg/960px-Sacred_Lotus_in_a_Pond.jpg",
	"https://image.giacngo.vn/w800/Uploaded/2026/uobkhuo/2026_03_05/lotus-6588180-5776-1144.jpg",
	"https://image.giacngo.vn/w800/Uploaded/2026/uobkhuo/2025_09_26/40967946701-0bc7785deb-k-4761-7365.jpg",
	"https://image.giacngo.vn/w770/Uploaded/2026/xpcwvolc/2025_03_30/z6373704203277-6026b52ce01965d9955a215ca8042b17-2022-3765.jpg",
	"https://image.giacngo.vn/w770/Uploaded/2026/xpcwvolc/2025_10_24/adobestock-1144718185-9504-3050.png",
	"https://image.giacngo.vn/w770/UserImages/2018/02/07/11/lotus.jpg",
	"https://image.giacngo.vn/w770/Uploaded/2026/estnselxslt/2024_10_24/2206-hoa-sen-o-nhat-16-6625.jpg",
	"https://image.giacngo.vn/w770/Uploaded/2026/xpcwvolc/2022_04_02/images1380699-sen9-5294.jpg",
	"https://image.giacngo.vn/w770/Uploaded/2026/xpcwvolc/2026_02_06/adobestock-569366288-1-748-2882.jpeg",
	"https://image.giacngo.vn/w770/Uploaded/2026/uobkhuo/2025_08_13/6487131437-44f4329fff-o-1524-4923.jpg",
	"https://image.giacngo.vn/w770/Uploaded/2026/uobkhuo/2025_07_03/358423035-307454275275591-1145447003689007197-n-3754-9131.jpg",
	"https://image.giacngo.vn/w770/Uploaded/2026/estnselxslt/2025_02_14/buddha-and-the-gospel-of-buddhism-1916-14779469804-9412-1713.jpg",
	"https://image.giacngo.vn/w770/Uploaded/2026/xeqdwjxydwestyuf/2021_06_01/sen12-9814.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Nelumbo_nucifera_in_Ueno_park.jpg/960px-Nelumbo_nucifera_in_Ueno_park.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/5/5e/Nelumbo-nucifera-3-_1200.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nelumbo_nucifera_%2829726301630%29.jpg/960px-Nelumbo_nucifera_%2829726301630%29.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Nelumbo_nucifera_%289152508014%29.jpg/960px-Nelumbo_nucifera_%289152508014%29.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Lotus_Flower_%28Nelumbo_nucifera%29_in_Lumbini_Heritage_Site-IMG_7283.jpg/960px-Lotus_Flower_%28Nelumbo_nucifera%29_in_Lumbini_Heritage_Site-IMG_7283.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Lotus_flower_nelumbo_nucifera.jpg/960px-Lotus_flower_nelumbo_nucifera.jpg",	
	"https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Pink_Lotus_at_Barju_Lake_01.jpg/960px-Pink_Lotus_at_Barju_Lake_01.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Nelumbo_nucifera_in_Wuyishan_Wufu_2012.08.24_13-48-09.jpg/960px-Nelumbo_nucifera_in_Wuyishan_Wufu_2012.08.24_13-48-09.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Nelumbo_nucifera_in_Wuyishan_Wufu_2012.08.24_13-27-49.jpg/960px-Nelumbo_nucifera_in_Wuyishan_Wufu_2012.08.24_13-27-49.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Lotus_in_Bandung.jpg/960px-Lotus_in_Bandung.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Brockhaus_and_Efron_Encyclopedic_Dictionary_b11_310-0.jpg/960px-Brockhaus_and_Efron_Encyclopedic_Dictionary_b11_310-0.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/%E7%B4%85%E9%82%8A%E7%99%BD%E7%A2%97%E8%93%AE_Nelumbo_nucifera_%27Red-edged_White_Miniature%27_-%E9%A6%99%E6%B8%AF%E5%85%AC%E5%9C%92_Hong_Kong_Park-_%2812359941315%29.jpg/960px-%E7%B4%85%E9%82%8A%E7%99%BD%E7%A2%97%E8%93%AE_Nelumbo_nucifera_%27Red-edged_White_Miniature%27_-%E9%A6%99%E6%B8%AF%E5%85%AC%E5%9C%92_Hong_Kong_Park-_%2812359941315%29.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Lotus-4312140_1920.jpg/960px-Lotus-4312140_1920.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/%E8%8D%B7%E8%8A%B1-%E8%A4%87%E7%93%A3%E9%BB%83%E8%93%AE%E5%9E%8B_Nelumbo_nucifera_Multiple-series_-%E6%B7%B1%E5%9C%B3%E6%B4%AA%E6%B9%96%E5%85%AC%E5%9C%92_Shenzhen_Honghu_Park%2C_China-_%289213340487%29.jpg/960px-%E8%8D%B7%E8%8A%B1-%E8%A4%87%E7%93%A3%E9%BB%83%E8%93%AE%E5%9E%8B_Nelumbo_nucifera_Multiple-series_-%E6%B7%B1%E5%9C%B3%E6%B4%AA%E6%B9%96%E5%85%AC%E5%9C%92_Shenzhen_Honghu_Park%2C_China-_%289213340487%29.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/P4230227.jpg_-_Flickr_-_zorrotran.jpg/960px-P4230227.jpg_-_Flickr_-_zorrotran.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Pink_nelumbo_flower1.jpg/960px-Pink_nelumbo_flower1.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fleur_de_lotus_sacr%C3%A9.jpg/960px-Fleur_de_lotus_sacr%C3%A9.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Pink_nelumbo_flower.jpg/960px-Pink_nelumbo_flower.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/HanaNoHasu2.jpg/960px-HanaNoHasu2.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Pink_lotus_flower_blooming_in_a_village_lake_waters_ramanathapuram_tamilnadu_India.jpg/960px-Pink_lotus_flower_blooming_in_a_village_lake_waters_ramanathapuram_tamilnadu_India.jpg",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Indian_lotus_Flower.jpg/960px-Indian_lotus_Flower.jpg",
	
	
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
