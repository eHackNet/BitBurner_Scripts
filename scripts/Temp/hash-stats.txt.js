import { formatMoney, formatNumberShort, formatDuration, parseShortNumber, scanAllServers } from '/scripts/helpers.js'
export async function main(ns) { try { let result = ""; try { result = JSON.stringify([ns.hacknet.numHashes(), ns.hacknet.hashCapacity()]); } catch { }
        if (ns.read("/scripts/Temp/hash-stats.txt") != result) await ns.write("/scripts/Temp/hash-stats.txt", result, 'w'); } catch(err) { ns.tprint(String(err)); throw(err); } }
