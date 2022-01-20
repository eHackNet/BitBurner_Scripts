/** @param {NS} ns **/
    
export async function main(ns) {
    ns.disableLog("disableLog");
    ns.disableLog("sleep");
    const doc = document; // This is expensive! (25GB RAM) Perhaps there's a way around it? ;)
    const hook0 = doc.getElementById('overview-extra-hook-0');
    const hook1 = doc.getElementById('overview-extra-hook-1');
    while (true) {
        try {
            const headers = []
            const values = [];

            const allStocks = getAllStocks(ns);
            // keep a log of net worth change over time
            const portfolioValue = getPortfolioValue(allStocks);
            const cashValue = ns.getPlayer().money;
            const totalValue = portfolioValue + cashValue;
            
            // Add script income per second
            headers.push("Inc");
            values.push(ns.getScriptIncome()[0].toPrecision(7) + 's');
            // Add script exp gain rate per second
            headers.push("Exp");
            values.push(ns.getScriptExpGain().toPrecision(7) + 's');
            // TODO: Add more neat stuff
            headers.push("Stock:")
            values.push(ns.nFormat(portfolioValue, "$0.000a"));
            
            // Now drop it into the placeholder elements
            hook0.innerText = headers.join(" \n");
            hook1.innerText = values.join("\n");
        } catch (err) { // This might come in handy later
            ns.print("ERROR: Update Skipped: " + String(err));
        }
        await ns.sleep(1000);
    }
}

function getAllStocks(ns) {
    // make a lookup table of all stocks and all their properties
    const stockSymbols = ns.stock.getSymbols();
    const stocks = {};
    for (const symbol of stockSymbols) {

        const pos = ns.stock.getPosition(symbol);
        const stock = {
            symbol: symbol,
            forecast: ns.stock.getForecast(symbol),
            volatility: ns.stock.getVolatility(symbol),
            askPrice: ns.stock.getAskPrice(symbol),
            bidPrice: ns.stock.getBidPrice(symbol),
            maxShares: ns.stock.getMaxShares(symbol),
            shares: pos[0],
            sharesAvgPrice: pos[1],
            sharesShort: pos[2],
            sharesAvgPriceShort: pos[3]
        };
        stock.summary = `${stock.symbol}: ${stock.forecast.toFixed(3)} ± ${stock.volatility.toFixed(3)}`;
        stocks[symbol] = stock;
    }
    return stocks;    
}

function getPortfolioValue(stocks) {
    let value = 0;
    for (const stock of Object.values(stocks)) {
        value += stock.bidPrice * stock.shares - stock.askPrice * stock.sharesShort;
    }
    return value;
}
