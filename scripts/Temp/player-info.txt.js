import { formatMoney, formatNumberShort, formatDuration, parseShortNumber, scanAllServers } from '/scripts/helpers.js'
export async function main(ns) { try { let result = ""; try { result = JSON.stringify(ns.getPlayer()); } catch { }
        if (ns.read("/scripts/Temp/player-info.txt") != result) await ns.write("/scripts/Temp/player-info.txt", result, 'w'); } catch(err) { ns.tprint(String(err)); throw(err); } }
