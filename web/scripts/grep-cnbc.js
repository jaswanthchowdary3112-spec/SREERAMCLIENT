const fetch = require('node-fetch');

async function test() {
    const ticker = process.argv[2] || 'AAPL';
    console.log(`Testing ticker: ${ticker}`);
    const res = await fetch(`https://www.cnbc.com/quotes/${ticker}`);
    const html = await res.text();
    
    const keys = ['open', 'previous_close', 'closePrice', 'price', 'last', 'low', 'high', 'priceChangePercent'];
    keys.forEach(k => {
        const regex = new RegExp(`"${k}"\\s*:\\s*"?([^",}]+)"?`, 'g');
        let match;
        console.log(`Searching for: ${k}`);
        while ((match = regex.exec(html)) !== null) {
            console.log(`  Found: ${match[0]}`);
        }
    });

    // Also look for common JSON patterns
    if (html.includes('__NEXT_DATA__')) {
        console.log('Found __NEXT_DATA__');
    }
}
test();
