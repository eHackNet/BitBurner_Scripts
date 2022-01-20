/** @param {NS} ns**/

export async function main(ns) {

	ns.disableLog("ALL"); // Visual clarity

    // Welcome to the Sequencer part 2: Profit Observer
    // This script is a little more complicated to explain easily, it dedicates high RAM servers to attack high profit servers
    // This is also set and forget, your EXEs and hacking level are reacquired each second, so new servers are added without needing to reboot it
    // Well I hope this brings you ideas, knowledge and or profits 😀

	var files = ["weak.script", "grow.script", "hack.script"];//No touching, unless you understand everything here
	await ns.write(files[0], "weaken(args) ", "w"); await ns.write(files[1], "grow(args) ", "w"); await ns.write(files[2], "hack(args) ", "w");
	var serverList; var targetList; var hostList; var exes; var temp; 
	var cycle = [0, "─", "\\", "|", "/"]; var latest = [["-", "-"], ["-", "-"], ["-", "-"]];
	if (false) { brutessh(); ftpcrack(); relaysmtp(); httpworm(); sqlinject() } //Avoid RAM cost bypass error

	//var pServers = await ns.prompt("Use player servers as hosts?");

	async function scanExes() {

		exes = ["BruteSSH", "FTPCrack", "relaySMTP", "SQLInject", "HTTPWorm"];

		for (let i = 0; i <= exes.length - 1; i++) { if (!ns.fileExists(exes[i] + ".exe")) { exes.splice(i, 1); i-- } }//Removes EXEs you don't have

	}

	function arraySort(array) { return array.sort(function (a, b) { return b[0] - a[0] }) }//Sorts nested arrays


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
    
    let tools=0;
    ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'].forEach(t=>{
        if(ns.fileExists(t)) tools++;    
    })

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
    

		if (cycle[0] >= 4) { cycle[0] = 0 }; cycle[0]++;//Speen

		ns.clearLog();
		//ns.print("ERROR   ╠═══╝ Priority Servers       Balance     ║")
		ns.print("WARNING ╠═════╣ PROFIT ╠═════════╗ HOST ╔════════╣");
		for(let serv of serversProfit) {
				
				ns.print(`INFO    ╠═════╣ ${(serv.profit.toFixed(2)+'').padEnd(6)} ║     ${serv.name.padEnd(pad)}  ║`);
				
			}
		ns.print("WARNING ╠═════╣ PROFIT ╠═════════╗ HOST ╔════════╣");
	


	}

	async function scanServers() {//Finds all servers
		serverList = ns.scan("home"); let serverCount = [serverList.length, 0]; let depth = 0; let checked = 0; let scanIndex = 0;

		while (scanIndex <= serverCount[depth] - 1) {

			let results = ns.scan(serverList[checked]); checked++;

			for (let i = 0; i <= results.length - 1; i++) {

				if (results[i] != "home" && !serverList.includes(results[i])) {

					serverList.push(results[i]); serverCount[depth + 1]++

				}

			}

			if (scanIndex == serverCount[depth] - 1) { scanIndex = 0; depth++; serverCount.push(0) } else { scanIndex++ };

		}

	}

	async function checkServers() {//Sorts servers into lists based on RAM and money/hack time ratio: hostList and targetList

		targetList = []; hostList = [[ns.getServerMaxRam("home"), "home"]];

		

		for (let i = 0; i <= serverList.length - 1; i++) {

			let cTarget = serverList[i];

			if (ns.getServerMoneyAvailable(cTarget) > 0 || ns.getServerMaxRam(cTarget) > 2) {//Filters out servers like darkweb

				if (ns.getServerNumPortsRequired(cTarget) <= exes.length) {

					for (let i = 0; i <= exes.length - 1; i++) { ns[exes[i].toLowerCase()](cTarget) }//Runs all EXEs you have

					ns.nuke(cTarget);//Ghandi.jpeg

					temp = [Math.floor(ns.getServerMaxMoney(cTarget) / ns.getServerMinSecurityLevel(cTarget)), cTarget];

					if (ns.getServerMoneyAvailable(cTarget) != 0 && !targetList.includes(temp) && ns.getServerRequiredHackingLevel(cTarget) <= ns.getHackingLevel()) {

						targetList.push(temp); targetList = arraySort(targetList);

					}

					temp = [ns.getServerMaxRam(cTarget), cTarget];

					if (ns.getServerMaxRam(cTarget) > 2 && !hostList.includes(cTarget)) {

						hostList.push(temp); hostList = arraySort(hostList)

					}

					await ns.scp(files, "home", cTarget);

				}

			}

		}

	}


	ns.tail()

	while (true) { //Keeps everything running once per second

		await scanExes()
		await scanServers()
		await checkServers()
		await log()
		await ns.asleep(1000)

	}
}
