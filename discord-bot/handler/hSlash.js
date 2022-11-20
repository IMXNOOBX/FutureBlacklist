const { readdirSync } = require('fs')
let slashCmd = []
module.exports = (client) => {


    const commands = readdirSync(`./cmds/slashCommands/`).filter(file => file.endsWith('.js'));

    for (let file of commands) {
        let slah = require(`../cmds/slashCommands/${file}`);

        if (slah.name) {
            client.commands.slash.set(slah.name, slah);
            slashCmd.push(slah);
        } else {
            client.log.error('[BOT] | Error Loading: ' + slah.name)
            continue;
        }

    }


    client.log.console('[BOT] | Slash Commands Loaded Sucessfully!');

    client.on('ready', async () => {
        await client.application.commands.set(slashCmd) //Registering new slash comands
    })

}
