/** @param {NS} ns**/
export async function main(ns) {

	ns.disableLog("ALL"); // Visual clarity

    // Welcome to the Sequencer part 2: Profit Observer
    // This script is a little more complicated to explain easily, it dedicates high RAM servers to attack high profit servers
    // This is also set and forget, your EXEs and hacking level are reacquired each second, so new servers are added without needing to reboot it
    // Well I hope this brings you ideas, knowledge and or profits 😀

	async function log() {//The display
	let serversFound = new Set();
    let serversProfit = [];
    let stack = [];
    let origin = ns.getHostname();
    stack.push(origin);

    while(stack.length > 0) {
        let server = stack.pop();
        if (!serversFound.has(server)){
            serversFound.add(server);
            let neighbors = ns.scan(server);
            for (let serv of neighbors) {
                if (!serversFound.has(serv))
                    stack.push(serv);
            }
        }
    }

    let cores = ns.getServer('home').cpuCores;
    let servers = Array.from(serversFound);
    for(let server of servers){
        if( ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()
            || ns.getServerNumPortsRequired(server) > tools ){
            continue;
        }

        let money = ns.hackAnalyzeChance(server) * ns.hackAnalyze(server) * ns.getServerMaxMoney(server);
        let gt = ns.growthAnalyze(server, 1/0.5, cores);
        let profit = money / (ns.getGrowTime(server)*gt);

        serversProfit.push({
            name: server,
            profit: profit* 1000,
        });
    }
    
    serversProfit.sort( (a,b) => b.profit-a.profit );

    let pad = servers.reduce((acc, elem) => Math.max(acc, elem.length), 0)
    
		ns.clearLog();
		ns.print("WARNING ╠═════╣ PROFIT ╠═════════╗ HOST ╔════════╣");
		for(let serv of serversProfit) {
				ns.print(`INFO    ╠═════╣ ${(serv.profit.toFixed(2)+'').padEnd(6)} ║     ${serv.name.padEnd(pad)}  ║`);
			}
		ns.print("WARNING ╠═════╣ PROFIT ╠═════════╗ HOST ╔════════╣");

	}
	ns.tail()
	while (true) { //Keeps everything running once per second
		await log()
		await ns.asleep(1000)
	}
}
