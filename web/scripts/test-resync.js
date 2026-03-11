const fetch = require('node-fetch');

// Reset specific tickers to be stale so they get re-synced
// We do this by calling the sync API with a list of tickers to force-reset

async function main() {
    const etfTickers = ['AFTY','ASHX','CHIE','CHII','CHIM','CHIX','CNHX','CSEX','FNI','HAHA','PEK','XINA','YAO','CHAD','GOEV','INFI','FUV','LTHM','IDEX','ABML'];
    
    console.log('Calling force sync for ETF tickers...');
    const r = await fetch('https://sreerammmclient.vercel.app/api/sync?force=true&tickers=' + etfTickers.join(','));
    const j = await r.json();
    console.log('Sync response:', JSON.stringify(j));
    
    // Wait and then check
    await new Promise(res => setTimeout(res, 5000));
    const m = await fetch('https://sreerammmclient.vercel.app/api/movers').then(r => r.json());
    const mList = [...(m.movers?.gainers || []), ...(m.movers?.losers || []), ...(m.watchlist || [])];
    const etfs = etfTickers;
    const found = mList.filter(x => etfs.includes(x.ticker));
    console.log('ETF prices after sync:', JSON.stringify(found.map(x => ({ t: x.ticker, p: x.price, o: x.openPrice }))));
}

main();
