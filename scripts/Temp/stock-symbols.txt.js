import { formatMoney, formatNumberShort, formatDuration, parseShortNumber, scanAllServers } from '/scripts/helpers.js'
export async function main(ns) {
        try {
                let result = ""; try { result = JSON.stringify(ns.stock.getSymbols()); } catch { }
                if (ns.read("/scripts/Temp/stock-symbols.txt") != result) await ns.write("/scripts/Temp/stock-symbols.txt", result, 'w');
        } catch (err) { ns.tprint(String(err)); throw (err); }
}
