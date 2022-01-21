import { formatMoney, formatNumberShort, formatDuration, parseShortNumber, scanAllServers } from '/scripts/helpers.js'
export async function main(ns) { try { let result = ""; try { result = JSON.stringify(Object.fromEntries(ns.getOwnedSourceFiles().map(sf => [sf.n, sf.lvl]))); } catch { }
        if (ns.read("/scripts/Temp/owned-source-files.txt") != result) await ns.write("/scripts/Temp/owned-source-files.txt", result, 'w'); } catch(err) { ns.tprint(String(err)); throw(err); } }
