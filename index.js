//главный исполняемый файл
const fs = require('node:fs');
const path = require('node:path');
const {Base, idGenerator, genEmbed, dateSet} = require('./fireteams_module');

const { Client, Collection, GatewayIntentBits} = require("discord.js");
require("dotenv").config();

if (!process.env.TOKEN){
    console.log('Отсутствует .env файл с конфигурацией!');
    return;
}
//создание объекта клиента
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildIntegrations]});

//добавление к клиенту коллекций (по сути Map из javascript) для данных
client.commands = new Collection(); //слэш-команды
client.settings = new Collection(); //настройки сервера (свой тип данных)
//client.actGens = new Collection();
client.mapVotes = new Collection(); 
//загрузка исполняемого кода для команд
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles){
    
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    //если в объекте, который представляет слэш-команду, есть свойства data и execute, то добавляем его в выше созданную коллекцию
    if ('data' in command && 'execute' in command){
        client.commands.set(command.data.name, command);
    } else{
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property`);
    }
}
//загрузка исполняемого кода для событий

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {

    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    //добавление обработчиков событий
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

//загрузка исполняемого кода для команд контекстного меню

client.contextCommands = new Collection(); //команды контекстного меню

const contextCommandsPath = path.join(__dirname, 'context_commands');
const contextCommandFiles = fs.readdirSync(contextCommandsPath).filter(file => file.endsWith('js'));

for(const file of contextCommandFiles){
    const contextCommandPath = path.join(contextCommandsPath, file);
    const contextCommand = require(contextCommandPath);
    //если в объекте, который представляет команду контекстного меню, есть свойства data и execute, то добавляем его в выше созданную коллекцию
    if ('data' && 'execute' in contextCommand){
        client.contextCommands.set(contextCommand.data.name, contextCommand);
    } else{
        console.log(`[WARNING] The Context Command at ${contextCommandPath} is missing a required "data" or "execute" property`);
    }
}

client.generateId = idGenerator;
client.genEmbed = genEmbed;
client.dateSet = dateSet;
Base.client = client;
//запуск бота
client.login(process.env.TOKEN);