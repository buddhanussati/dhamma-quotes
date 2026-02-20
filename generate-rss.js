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

// 3. Split the block of text by the <hr> tags to isolate individual quotes
const quotes = htmlContent.split('<hr>').map(q => q.trim()).filter(q => q.length > 0);

// 4. Select a random quote
const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

// 5. Build the RSS XML format
const pubDate = new Date().toUTCString();
const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Thanissaro Bhikkhu Quotes</title>
    <link>https://buddhanussati.github.io/dhamma-quotes/</link>
    <description>Random Dhamma quotes updated every 6 hours</description>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <item>
      <title>Dhamma Quote for ${pubDate}</title>
      <link>https://buddhanussati.github.io/dhamma-quotes/</link>
      <description><![CDATA[
        ${randomQuote}
      ]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${Date.now()}</guid>
    </item>
  </channel>
</rss>`;

// 6. Save the output to a new file called rss.xml
fs.writeFileSync('rss.xml', rssXml);
console.log("rss.xml generated successfully!");