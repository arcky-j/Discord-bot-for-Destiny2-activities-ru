//главный исполняемый файл
const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, GatewayIntentBits} = require("discord.js");
require("dotenv").config();

const CustomTimer = require('./utility/custom_timer.js');
const CacheManager = require('./utility/cache_manager.js');
const Reset = require('./entities/reset.js');

if (!process.env.TOKEN){
    console.log('Отсутствует .env файл с конфигурацией!');
    return;
}
//создание объекта клиента
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildIntegrations]});

//добавление к клиенту коллекций (по сути Map из javascript) для данных
client.commands = new Collection(); //слэш-команды
client.fireteams = new Collection(); //боевые группы (свой тип данных)
client.polls = new Collection(); //голосования (свой тип данных)
client.settings = new Collection(); //настройки сервера (свой тип данных)
client.activities = new Collection(); //настройки сервера (свой тип данных)
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
//загрузка исполняемого кода для кнопок

client.buttons = new Collection(); //обработчики нажатий на кнопки

const buttonsPath = path.join(__dirname, 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('js'));

for(const file of buttonFiles){
    const buttonPath = path.join(buttonsPath, file);
    const button = require(buttonPath);
    //если в объекте, который представляет кнопку, есть свойства name и execute, то добавляем его в выше созданную коллекцию
    if ('name' && 'execute' in button){
        client.buttons.set(button.name, button);
    } else{
        console.log(`[WARNING] The button at ${buttonPath} is missing a required "name" or "execute" property`);
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
//загрузка исполняемого кода для обработки форм (всплывающих окон)

client.modals = new Collection(); //всплывающие окна

const modalsPath = path.join(__dirname, 'modals');
const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('js'));

for(const file of modalFiles){
    const modalPath = path.join(modalsPath, file);
    const modal = require(modalPath);
    //если в объекте, который представляет всплывающее окно, есть свойства name и execute, то добавляем его в выше созданную коллекцию
    if ('name' && 'execute' in modal){
        client.modals.set(modal.name, modal);
    } else{
        console.log(`[WARNING] The Modal at ${modalPath} is missing a required "name" or "execute" property`);
    }
}
client.reset = new Reset(); //добавление к клиенту модуля для работы с ресетами
//добавление к клиенту таймера и его запуск

client.timer = new CustomTimer(client);
client.timer.checkSeconds();
//добавление к клиенту модуля для работы с диском
client.cacheManager = new CacheManager(client.users, client.guilds, client);

client.generateId = require('./utility/id_generator');
//запуск бота
client.login(process.env.TOKEN);