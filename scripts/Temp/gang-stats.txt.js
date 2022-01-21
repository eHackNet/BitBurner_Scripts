import { formatMoney, formatNumberShort, formatDuration, parseShortNumber, scanAllServers } from '/scripts/helpers.js'
export async function main(ns) { try { let result = ""; try { result = JSON.stringify(ns.gang.inGang() ? ns.gang.getGangInformation() : false); } catch { }
        if (ns.read("/scripts/Temp/gang-stats.txt") != result) await ns.write("/scripts/Temp/gang-stats.txt", result, 'w'); } catch(err) { ns.tprint(String(err)); throw(err); } }
