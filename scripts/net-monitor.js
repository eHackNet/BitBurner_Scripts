import {
    getPlayerInfo,
    getPoolFromServers,
    getAllServerObjects,
    printfSeverAsTarget,
    C2Command,
    sendC2message,
} from '/scripts/bit-lib.js';
import { printfServer, printItemsNColumns, updateAttackStatus, boxdraw, percentToGraph } from '/scripts/bit-lib.js';
import { Server, pad, readC2messages, subsystems } from '/scripts/bit-lib.js';

/**@typedef{import('/scripts/index.js').NS} NS */

const displayTypes = ['Short', 'Targets1Up', 'Targets2Up'];

// Let's try to replicate all of the fancy monitoring and logging from net-hack.js here.
// That way we can move it out of net-hack.js and use that log for actual debugging.
/** @param {NS} ns */
export async function main(ns) {
    // Do something with arguments
    let args = ns.flags([
        ['start', false],
        ['stop', false],
        ['display', 'default'],
    ]);
    // case insensitive assignment, because I fumble it on the command line all the time
    let newDisplayType = displayTypes.find((t) => t.toLowerCase() === args.display.toLowerCase());
    if (newDisplayType) args.display = newDisplayType;

    if (displayTypes.findIndex((e) => e === args.display) === -1 && args.display !== 'default') {
        ns.tprint(`Invalid display type. Valid display types are: ${displayTypes}.`);
        return;
    }

    if (args.stop) {
        ns.tprint('Stopping any running monitors.');
        runStop(ns);
    } else if (args.start) {
        await runDisplayLoop(args.target, args.display, ns);
    } else {
        let msg = `
			Invalid flags.  Command line should include either:
				--start To begin monitoring, or
				--stop to end all monitoring.	
			Optional:
				--display ${displayTypes}
			`;
        ns.tprint(msg);
        return;
    }
}

/** @param {NS} ns */
async function runDisplayLoop(displayTarget, _displayType, ns) {
    ns.disableLog('getServerRequiredHackingLevel');
    ns.disableLog('getServerMaxRam');
    ns.disableLog('getServerUsedRam');
    ns.disableLog('getServerMaxMoney');
    ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('getServerMinSecurityLevel');
    ns.disableLog('getServerSecurityLevel');
    ns.disableLog('getHackingLevel');
    ns.disableLog('sleep');
    ns.disableLog('asleep');

    let displayType = _displayType;
    if (displayType === 'default') displayType = 'Short';

    /** @type {Object.<string,Server} */
    let servers = {};
    /** @type {import('./bit-lib.js').Player} */
    let playerInfo = {};

    ns.tail();
    let lastlog = ``;
    let factionData;

    let on10 = 0,
        on50 = 0,
        on100 = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        on10 = ++on10 % 10;
        on50 = ++on50 % 50;
        on100 = ++on100 % 100;

        if (on10 == 1) {
            // Read our C2 messages. We're doing it inline so that we can update locals more easily.
            let inbox = await readC2messages('net-monitor', ns);
            for (const msg of inbox) {
                let requeue = true;
                if (msg instanceof C2Command && msg.action === 'set') {
                    if (msg.key === 'display' && _displayType === 'default') {
                        if (msg.value === 'next') {
                            let i = displayTypes.findIndex((t) => t === displayType);
                            i = ++i % displayTypes.length;
                            displayType = displayTypes[i];
                        } else {
                            let newDisplayType = displayTypes.find((t) => t.toLowerCase() === msg.value.toLowerCase());
                            if (newDisplayType) displayType = newDisplayType;
                        }
                        requeue = false;
                    }
                }
                // If we didn't handle the message, put it back on the c2 queue.
                if (requeue) await sendC2message(msg, ns);
            }
        }

        if (on100 == 1) {
            // Update our player info.
            playerInfo = getPlayerInfo(ns);

            //factionData = ns.getFactionFavor('${factionName}');
        }

        // Get all the servers, including any newly purchased ones, and refresh the data on them.
        servers = getAllServerObjects(servers, ns);
        // Get the status of the attack.
        updateAttackStatus(servers, ns);
        // Get the status of any running subsystems
        updateSubsystemInfo(ns);

        // Finally, print a fancy log of the current state of play
        printFancyLog(servers, displayType, playerInfo, ns);
        if (lastlog) ns.print(lastlog);
        await ns.asleep(100);
    }
}

/**
 * @param {NS} ns
 */
function updateSubsystemInfo(ns) {
    for (const subsys of subsystems) {
        subsys.refreshStatus(ns);
    }
}

/** @param {NS } ns */
function runStop(ns) {
    ns.scriptKill(ns.getScriptName(), ns.getHostname());
}

/**
 *
 * @param {Object.<string,Server>} servers
 * @param {Server[]} targets
 * @param {*} logType
 * @param {*} playerInfo
 * @param {NS} ns
 */
export function printFancyLog(servers, logType, playerInfo, ns) {
    ns.clearLog(...ns.args);
    const insideWidth = 48;

    let lines = [];

    // Printing.  Kind of hacky use of the logtype. Should probably fix it.
    let printColumns = (data) => printItemsNColumns(data, 1, ns.print);
    if (logType.endsWith('2Up')) {
        printColumns = (data) => printItemsNColumns(data, 2, ns.print);
    } else if (logType.endsWith('3Up')) {
        printColumns = (data) => printItemsNColumns(data, 3, ns.print);
    }
    let print1Column = (data) => printItemsNColumns(data, 1, ns.print);

    let thirtySecondsAgo = Date.now() - 30000;
    let targets = Object.values(servers);
    // Simply filtering by being the target of an attack is fine, but it results in too much churn. Let's do some sort of decay time instead.
    targets = targets.filter(
        (s) =>
            s.lastTimeSeenTargetedBy.hack > thirtySecondsAgo ||
            s.lastTimeSeenTargetedBy.grow > thirtySecondsAgo ||
            s.lastTimeSeenTargetedBy.weaken > thirtySecondsAgo
    );
    let hackTargets = targets.filter((t) => t.lastTimeSeenTargetedBy.hack > thirtySecondsAgo);
    let prepTargets = targets.filter((t) => t.lastTimeSeenTargetedBy.hack <= thirtySecondsAgo);

    let cmpByTotalAttackThreads = function (a, b) {
        let at = a.targetedBy.hack + a.targetedBy.weaken + a.targetedBy.grow;
        let bt = b.targetedBy.hack + b.targetedBy.weaken + b.targetedBy.grow;
        return at - bt;
    };
    /**@param {Server} a @param {Server} b*/
    let cmpByMoneyBeingHacked = function (a, b) {
        let am = getAmountTargetedToBeHacked(a, ns);
        let bm = getAmountTargetedToBeHacked(b, ns);
        return am - bm;
    };
    let cmpByMaxMoney = function (a, b) {
        let am = a.maxMoney;
        let bm = b.maxMoney;
        return am - bm;
    };
    /** @param{Server} a */
    let cmpByCurrentMoney = function (a, b) {
        let am = a.currentMoney;
        let bm = b.currentMoney;
        return am - bm;
    };
    // Get our hack and prep lists sorted
    hackTargets.sort(cmpByMoneyBeingHacked).reverse();
    prepTargets.sort(cmpByTotalAttackThreads).reverse();

    /* Let's try to get organized. Each section is an array of already-formatted lines. 
       Generate all of them first, then print them at the end based on what's populated 
       and what our logType calls for. */
    /**@type{Object.<string, string[][]>} */
    let sections = {
        hackTargets: [],
        prepTargets: [],
        allServers: [],
        home: [],
        subsystems: [],
        swarmStatus: [],
        targetStatus: [],
        factionStatus: [],
    };

    // === TARGET DETAIL ===
    //  --- Hacking ---
    //ns.print(`    ${hackTargets.map((target) => target.name).join(', ')}`);
    for (const target of hackTargets) {
        let data = printfSeverAsTarget(target, ns);
        sections.hackTargets.push(data);
    }
    if (hackTargets.length === 0) sections.hackTargets.push(['', '', '']);
    //  --- Prepping ---
    for (const target of prepTargets) {
        let data = printfSeverAsTarget(target, ns);
        sections.prepTargets.push(data);
    }
    if (prepTargets.length === 0) sections.prepTargets.push(['', '', '']);
    // === SERVER DETAIL ===
    for (const servername in servers) {
        let server = servers[servername];
        let data = printfServer(server, ns);
        sections.allServers.push(data);
    }
    // === HOME DATA ===
    sections.home.push(formatHomeSection(servers, ns, insideWidth));
    sections.subsystems.push(formatSubsystemSection(ns, insideWidth));
    // --- SWARM STATUS ---
    // get information about the current pool of workers, and reformat everything as pretty strings.
    let pool = getPoolFromServers(servers, ns);
    let percentUsed = pool.running / (pool.free + pool.running);
    let graph = percentToGraph(percentUsed, '          ');
    percentUsed = ns.nFormat(percentUsed, '0%');

    for (const key in pool) {
        pool[key] = ns.nFormat(pool[key], '0a');
    }
    const free = pad(Array(5).join(' '), pool.free, true);
    const running = pad(Array(5).join(' '), pool.running, true);

    // --- Swarm status ---
    lines = [
        `  Free: ${free}, Running: ${running} (${percentUsed})    ${graph}`,
        `  Hack: ${pool.hack}, Grow: ${pool.grow}, Weaken: ${pool.weaken}`,
    ];
    let data = boxdraw(lines, 'Swarm Status', insideWidth);
    sections.swarmStatus.push(data);

    // --- Target Summary ---
    lines = [`  Being Hacked: ${hackTargets.length}, Being Prepared: ${prepTargets.length}`];
    data = boxdraw(lines, 'Target Summary', insideWidth);
    sections.targetStatus.push(data);

    // === FACTION STATUS ===

    // === PRINT SECTIONS ===
    if (logType.includes('Targets')) {
        // Limit the display to 4 lines, else it gets too big.
        let topN = 4;
        if (logType.includes('2Up')) topN = 8;
        let topHackTargets = hackTargets.slice(0, topN);
        let otherHackTargets = hackTargets.slice(topN, hackTargets.length);
        // Use a more stable sort for this bit, so they don't go moving around all the time.
        otherHackTargets.sort(cmpByMaxMoney).reverse();

        let hackTargetsThreadCount = hackTargets
            .map((t) => t.targetedBy)
            .reduce((sum, t) => sum + t.hack + t.grow + t.weaken, 0);
        let topHackTargetsThreadCount = topHackTargets
            .map((t) => t.targetedBy)
            .reduce((sum, t) => sum + t.hack + t.grow + t.weaken, 0);
        let otherHackTargetsThreadCount = otherHackTargets
            .map((t) => t.targetedBy)
            .reduce((sum, t) => sum + t.hack + t.grow + t.weaken, 0);
        let prepTargetsThreadCount = prepTargets
            .map((t) => t.targetedBy)
            .reduce((sum, t) => sum + t.hack + t.grow + t.weaken, 0);

        let topHackThreadCount = ns.nFormat(topHackTargetsThreadCount, '0.0a');
        let otherHackThreadCount = ns.nFormat(otherHackTargetsThreadCount, '0.0a');
        let prepThreadCount = ns.nFormat(prepTargetsThreadCount, '0.0a');

        // Print the top N targets
        ns.print(`Hacking top ${topHackTargets.length} targets, using ${topHackThreadCount} threads: `);
        printColumns(sections.hackTargets.slice(0, topN));

        let overflowsection = [];
        // And a summary of the rest.
        if (hackTargets.length > topN) {
            let targetTitle = `Hacking ${otherHackTargets.length} more targets, using ${otherHackThreadCount} threads`;
            let targetstr = otherHackTargets
                .map((target) => target.name + ` (${ns.nFormat(getAmountTargetedToBeHacked(target, ns), '$0a')})`)
                .join(', ');
            // Even this summary gets long if there are more than about 10 in this list.
            if (otherHackTargets.length > 10) {
                let shortlist = otherHackTargets.slice(0, 8);
                let rest = otherHackTargets.slice(8, otherHackTargets.length);
                let restThreads = ns.nFormat(
                    rest.map((server) => server.targetedBy.total).reduce((sum, threads) => sum + threads, 0),
                    '0a'
                );
                let shortnames =
                    'Including ' +
                    shortlist
                        .map(
                            (target) => target.name + ` (${ns.nFormat(getAmountTargetedToBeHacked(target, ns), '$0a')})`
                        )
                        .join(', ');
                shortnames += `, and ${rest.length} more using ${restThreads} threads.`;
                targetstr = shortnames;
            }
            let boxedstr = boxdraw([targetstr], targetTitle, insideWidth, true);
            overflowsection.push(boxedstr);
        }

        if (hackTargets.length + prepTargets.length <= 6) {
            ns.print(`Preparing ${prepTargets.length} targets, using ${prepThreadCount} threads:`);
            printColumns(sections.prepTargets);
        } else {
            let title = `Preparing ${prepTargets.length} targets, using ${prepThreadCount} threads`;
            let prepstr = prepTargets
                .map((target) => target.name + ` (${ns.nFormat(target.targetedBy.total, '0a')})`)
                .join(', ');
            // Even this summary gets long if there are more than about 10 in this list.
            if (prepTargets.length > 10) {
                let shortlist = prepTargets.slice(0, 8);
                let rest = prepTargets.slice(8, prepTargets.length);
                let restThreads = ns.nFormat(
                    rest.map((server) => server.targetedBy.total).reduce((sum, threads) => sum + threads, 0),
                    '0a'
                );
                let shortnames =
                    'Including ' +
                    shortlist
                        .map((target) => target.name + ` (${ns.nFormat(target.targetedBy.total, '0a')})`)
                        .join(', ');
                shortnames += `, and ${rest.length} more using ${restThreads} threads.`;
                prepstr = shortnames;
            }
            let boxedstr = boxdraw([prepstr], title, insideWidth, true);
            overflowsection.push(boxedstr);
        }
        if (overflowsection.length > 0) {
            printColumns(overflowsection);
        }
        let swarm = [sections.swarmStatus[0], sections.targetStatus[0]];
        printColumns(swarm);
    }
    if (logType.includes('Servers')) {
        printColumns(sections.allServers);
    }
    if (logType === 'Short') {
        print1Column([sections.home, sections.subsystems, sections.swarmStatus, sections.targetStatus].flat(1));
    }

    // Print any common trailer stuff here.
}

function formatSubsystemSection(ns, insideWidth) {
    let runningSubsystems = subsystems.filter((s) => s.status === 'RUNNING');
    runningSubsystems.sort((a, b) => a.scriptInfo.onlineMoneyMade - b.scriptInfo.onlineMoneyMade).reverse();

    // Pad out the subsystem name display to fit in a neat column.
    let namePadLen = 21;
    let namePad = Array(namePadLen + 1).join(' ');
    let lines = [];

    for (const system of runningSubsystems) {
        let script = system.scriptInfo;
        let income = '';
        let cps = '';
        if (script.onlineMoneyMade !== 0) {
            income = ns.nFormat(script.onlineMoneyMade, '$0.0a');
            income = `${pad('       ', income, true)}`;
            cps = ns.nFormat(script.onlineMoneyMade / script.onlineRunningTime, '$0a');
            cps = `(${cps}/s)`;
        }
        let name = pad(namePad, system.name);
        let size = ns.nFormat(script.ramUsage * Math.pow(10, 9), '0.00 b');
        size = pad('       ', size, true);
        let line = `${name} ${size}  ${income} ${cps}`;
        lines.push(line);
    }
    return boxdraw(lines, 'Running subsystems', insideWidth);
}

/**
 * create a fancy box display with home and purchased server info.
 * @param {Object.<string, Server>} servers
 * @param {NS} ns
 * @param {number} insideWidth
 * @returns string[] lines
 */
function formatHomeSection(servers, ns, insideWidth) {
    let lines = [];
    let server = servers['home'];
    let ram = ns.nFormat(server.ram * Math.pow(10, 9), '0 b');
    let free = ns.nFormat(server.freeRam * Math.pow(10, 9), '0 b');
    let pctUsed = (server.ram - server.freeRam) / server.ram;
    // Let's display the percent in used in 5 characters, plus 2 more for brackets
    let progressbar = percentToGraph(pctUsed, '      ');
    ram = pad('      ', ram, true);

    let cores = `Cores `;
    cores += Array(server.cores + 1).join('▪');
    let t = '■■■■■■';
    cores = pad('                      ', cores);
    lines.push(`${cores}            ${ram} ${progressbar}`);

    // --- Purchased Servers ---
    let purchasedServers = Object.values(servers).filter((s) => s.isPurchasedServer);
    let num = purchasedServers.length;

    ram = purchasedServers.reduce((sum, server) => sum + server.ram, 0);
    free = purchasedServers.reduce((sum, server) => sum + server.freeRam, 0);
    pctUsed = (ram - free) / ram;

    progressbar = percentToGraph(pctUsed, '      ');
    ram = ns.nFormat(ram * Math.pow(10, 9), '0 b');
    ram = pad('      ', ram, true);

    free = ns.nFormat(free * Math.pow(10, 9), '0 b');
    free = pad('      ', free, true);
    if (num > 0) {
        let symbols = purchasedServers.map((s) => s.symbol).join('');
        symbols = pad('                         ', symbols);
        lines.push(`Servers ${symbols} ${ram} ${progressbar}`);
    }
    lines = boxdraw(lines, 'Home', insideWidth);
    return lines;
}

/**
 * The amount to be hacked from this server, assuming all incoming hack threads hit at max money.
 * @param {Server} server
 * @param {NS} ns
 */
function getAmountTargetedToBeHacked(server, ns) {
    let hf = server.hackFactor;
    if (ns.ls('home', 'Formulas.exe').length > 0)
        hf = ns.formulas.hacking.hackPercent(ns.getServer(server.name), ns.getPlayer());
    return hf * server.targetedBy.hack * server.maxMoney;
}
