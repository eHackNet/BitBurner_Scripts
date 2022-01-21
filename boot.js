/** @param {NS} ns **/
export async function main(ns) {
ns.exec("scripts/terminal.js", "home", 1); 
//ns.exec("nuburn/start.js", "home", 1);
ns.disableLog("disableLog"); 
ns.disableLog("exec");  
ns.exec("scripts/seqOne.js", "home", 1);
ns.exec("scripts/stats.js", "home", 1);
ns.exec("scripts/stocks.js", "home", 1);
//ns.exec("netmap.js", "home", 1);
//ns.exec("gui/server-list.js", "home", 1);
ns.exec("gui/process-list.js", "home", 1);
//ns.exec("/bb-vue/examples/0-getting-started.js", "home", 1);


ns.tprintf("<red>  +------------------------------------------+</red>");
ns.tprintf("<red>  |                                          |</red>");
ns.tprintf("<red>  |         ☢️ BOOTING SYSTEM ☢️            |</red>");
ns.tprintf("<red>  |                                          |</red>");
ns.tprintf("<red>  +------------------------------------------+</red>");
ns.tprintf(">");
ns.tprintf(">");
ns.tprintf("> Starting Boot Loader");
ns.tprintf("> BOARDInit status [0x0]");
ns.tprintf(">  Screen Orientation Core");
ns.tprintf(">  Board Detected");
ns.tprintf(">  Base Board Revision");
ns.tprintf(">  Daughter Card Revision");
ns.tprintf("> MCSPI Instance number: 0");
ns.tprintf("> Channel/Chip Select number: 0");
ns.tprintf("> The instance address is 48030000");
ns.tprintf("> <yellow>*</yellow> Running bb1.3-full 2022.01 Release Codename Bitburner");
ns.tprintf("> <yellow>*</yellow> Finished early booting sequence. <blue>[</blue> ok <blue>]</blue>");
ns.tprintf("> <yellow>*</yellow> Searching for BB file, this might take a few seconds...");
ns.tprintf("> ");
ns.tprintf("Starting version 1.3.0");
ns.tprintf("Begin: Loaging essential drivers ... done. ");
ns.tprintf("Begin: Running /scripts/mount ... done. ");
ns.tprintf("Begin: Mounting root file system ... Begin: Running /scripts/live ... done. ");
ns.tprintf("Begin: Running /scripts/live-mount ... done. ");
ns.tprintf("done. ");
ns.tprintf("> ");
ns.tprintf("> ");
ns.tprintf("Welcome to <white>BitBurner v1.3.0!</white>");
ns.tprintf("> ");
ns.tprintf("> Copying Data from Cache");
ns.tprintf("> Copying image from disk to server");
ns.tprintf("> Jumping to Bitburner v1.3.0 Application..");
ns.tprintf("> ");
ns.tprintf("> Loading framkework into memory...");
ns.tprintf("> Copying application image from SPI FLASH to Server RAM");
ns.tprintf("> Running framkework");
ns.tprintf(">");
ns.tprintf("> Reading package list... <green>Done</green>");
ns.tprintf(">");
ns.tprintf("> Reading state information... <green>Done</green>");
ns.tprintf(">");
ns.tprintf("> Reading program list...");
ns.tprintf(">");
ns.tprintf("> <green>Done</green>");
ns.tprintf(">");
ns.exec("scan.js", "home", 1);
ns.tprintf(">");
ns.tprintf("><white> The following packages will be executed:</white>");
ns.tprintf("><yellow> js:</yellow> terminal.js stock.js stats.js");
ns.tprintf("><yellow> script:</yellow> hackall.script hack.script weaken.script grow.script ");
ns.tprintf("><yellow> ns:</yellow> <none>");
ns.tprintf(">");
ns.tprintf(">");
ns.tprintf("> Preparing to execute <white>.../home/hackall.script</white>");
ns.tprintf("> Loading <white>hackall</white>... done.")
ns.tprintf(">");
ns.tprintf("> Preparing to execute <white>.../home/stats.js</white>");
ns.tprintf("> Loading <white>stats</white>... done.")
ns.tprintf(">");
ns.tprintf("> Preparing to execute <white>.../home/stock.js</white>");
ns.tprintf("> Loading <white>stocks</white>... done.")
ns.tprintf(">");
ns.tprintf("> Preparing to execute <white>.../home/term.js</white>");
ns.tprintf("> Loading <white>terminal</white>... done.")
ns.tprintf(">");
//ns.tprintf("> Preparing to execute <white>.../home/server-list.js</white>");
//ns.tprintf("> Loading <white>server-list</white>... done.")
//ns.tprintf(">");
ns.tprintf("> Preparing to execute <white>.../home/process-list.js</white>");
ns.tprintf("> Loading <white>process-list</white>... done.")
ns.tprintf(">");
ns.tprintf("><green> Loading Complete... </green>");
ns.tprintf(">");
ns.tprintf(">");
ns.tprintf("> Setting up <white>hackall </white>... done.");
ns.tprintf("> Setting up <white>stats </white>... done.");
ns.tprintf("> Setting up <white>stocks </white>... done.");
ns.tprintf("> Setting up <white>terminal </white>... done.");
//ns.tprintf("> Setting up <white>server-list </white>... done.");
ns.tprintf("> Setting up <white>process-list </white>... done.");
ns.tprintf(">");
ns.tprintf("> Processing triggers for <blue>hack();</blue> <blue>weaken();</blue> <blue>grow();</blue>");
ns.tprintf(">");
ns.tprintf("> <red>List of Available Scripts to run:</red>");
ns.tprintf(">");
ns.tprintf("> <red> Remeber MONITOR is Installed</red>");
ns.tprintf("><italic> This script helps visualize the money and security of a server.</italic>");
ns.tprintf("><white> USAGE:</white> <bold>run monitor.js SERVER_NAME</bold>");
ns.tprintf(">");
ns.tprintf("> <red> Remeber HACKNET is Installed</red>");
ns.tprintf("><italic> This script helps automize the purchase of HackNet servers.</italic>");
ns.tprintf("><white> USAGE:</white> <bold>run hacknet.script</bold>");
ns.tprintf(">");
ns.tprintf("> <red> Remeber NETMAP is Installed</red>");
ns.tprintf("><italic> This script a map of servers with detail functions.</italic>");
ns.tprintf("><white> USAGE:</white> <bold>run netmap.js</bold>");
ns.tprintf(">");
ns.tprintf("> <red> Remeber SERVER-LIST is Installed</red>");
ns.tprintf("><italic> This script loads a map of servers to hack and install backdoors.</italic>");
ns.tprintf("><white> USAGE:</white> <bold>run gui/server-list.js</bold>");
ns.tprintf(">");
ns.tprintf("> <red> Remeber DOCS is Installed</red>");
ns.tprintf("><italic> This script loads a list of NS Functions.</italic>");
ns.tprintf("><white> USAGE:</white> <bold>run docs.js h</bold>");
ns.tprintf(">");
ns.tprintf("")

}
