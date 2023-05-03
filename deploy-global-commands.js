//отдельный файл для регистрации команд на отдельно взятый сервер
const { REST, Routes} = require('discord.js');
require("dotenv").config();

const clientId = process.env.clientId;
const guildId = process.env.guildId;
const token = process.env.TOKEN;

const fs = require('node:fs');
//преобразование кода команд в json

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles){
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}
const contextCommandFiles = fs.readdirSync('./context_commands').filter(file => file.endsWith('.js'));

for (const file of contextCommandFiles){
    const command = require(`./context_commands/${file}`);
    commands.push(command.data.toJSON());
}
const rest = new REST({version: '10'}).setToken(token);
//регистрация команд
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application commands`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            {body: commands},
        );

        console.log(`Succesfully reloaded ${data.length} application commands`);
    } catch (error) {
        console.error(error);
    }

})();