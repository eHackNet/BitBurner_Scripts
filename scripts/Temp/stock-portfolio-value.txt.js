import { formatMoney, formatNumberShort, formatDuration, parseShortNumber, scanAllServers } from '/scripts/helpers.js'
export async function main(ns) { try { let result = ""; try { result = JSON.stringify(["ECP","MGCP","BLD","CLRK","OMTK","FSIG","KGI","FLCM","STM","DCOMM","HLS","VITA","ICRS","UNV","AERO","OMN","SLRS","GPH","NVMD","WDS","LXO","RHOC","APHE","SYSC","CTK","NTLK","OMGA","FNS","JGN","SGC","CTYS","MDYN","TITN"].map(sym => ({ sym, pos: ns.stock.getPosition(sym), ask: ns.stock.getAskPrice(sym), bid: ns.stock.getBidPrice(sym) })).reduce((total, stk) => total + stk.pos[0] * stk.bid + stk.pos[2] * (stk.pos[3] * 2 - stk.ask) -100000 * (stk.pos[0] + stk.pos[2] > 0 ? 1 : 0), 0)); } catch { }
        if (ns.read("/scripts/Temp/stock-portfolio-value.txt") != result) await ns.write("/scripts/Temp/stock-portfolio-value.txt", result, 'w'); } catch(err) { ns.tprint(String(err)); throw(err); } }