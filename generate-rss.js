const fs = require('fs');

// 1. Read the JS file containing the quotes
const fileContent = fs.readFileSync('thanissaro-quotes.js', 'utf8');

// 2. Extract the string content between the backticks
const match = fileContent.match(/const thanissaroQuotesData = `([\s\S]*?)`;/);
if (!match) {
    console.error("Could not find the quotes data.");
    process.exit(1);
}

const htmlContent = match[1];

// 3. Split by <hr> to get individual entries
const quotes = htmlContent.split('<hr>').map(q => q.trim()).filter(q => q.length > 0);

// 4. Select a random quote
const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

// 5. Generate the Title:
// Remove the <span class="cite-title">...</span><br> part
// Then strip all other HTML tags to get plain text for the title
let cleanText = randomQuote.replace(/<span class="cite-title">[\s\S]*?<\/span>\s*<br>/i, '');
cleanText = cleanText.replace(/<\/?[^>]+(>|$)/g, "").trim();

// Split into words and take the first 25
const words = cleanText.split(/\s+/);
const titleText = words.slice(0, 25).join(' ') + (words.length > 25 ? '…' : '');

// 6. Build the RSS XML
const pubDate = new Date().toUTCString();
const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Thanissaro Bhikkhu Quotes</title>
    <link>https://buddhanussati.github.io/dhamma-quotes/</link>
    <description>Dhamma quotes by Thanissaro Bhikkhu, updated every 6 hours</description>
    <lastBuildDate>${pubDate}</lastBuildDate>
	<atom:link href="https://buddhanussati.github.io/dhamma-quotes/rss.xml" rel="self" type="application/rss+xml" />
	<image>
      <title>dhammatalks.org</title>
      <url>https://www.dhammatalks.org/static/images/newlogo.png</url>
      <link>https://www.dhammatalks.org/</link>
      <width>42</width>
      <height>42</height>
    </image>
	
    <item>
      <title>${titleText}</title>
      <link>https://buddhanussati.github.io/dhamma-quotes/</link>
      <description><![CDATA[
        ${randomQuote}
      ]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${Date.now()}</guid>
    </item>
  </channel>
</rss>`;

fs.writeFileSync('rss.xml', rssXml);
console.log(`Generated RSS with title: ${titleText}`);