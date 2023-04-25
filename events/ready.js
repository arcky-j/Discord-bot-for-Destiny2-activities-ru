const Settings = require('../entities/settings.js');
const FireteamUntimed = require('../entities/fireteamUntimed.js');
const FireteamRes = require('../entities/fireteamRes.js');
const CustomActivity = require('../entities/customActivity.js');
const {Events} = require('discord.js');
const getRandomPresence = require('../utility/get_random_presence');
//срабатывает при запуске бота
module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        //оповещает в консоли, ставит первый статус и подгружает нужные кэши
        //console.log(`${client.user.tag} на связи и готов фаршмачить`);
        client.user.setPresence({activities: [{name: 'побег из микроволновки', type: 0}]}); //напоминаю, что все статусы созданы под образ босса Шпиля Хранителя и их всегда можно поменять  
        setInterval(() => {
            client.user.setPresence(getRandomPresence());
        }, 3600000);//3600000
        await Settings.initSettings().catch(err => console.log(`Ошибка инициализации настроек серверов: ${err.message}`));    
        FireteamUntimed.initAll().catch(err => console.log(`Ошибка загрузки сборов по готовности: ${err.message}`)); 
        FireteamRes.initAll().catch(err => console.log(`Ошибка загрузки стандартных сборов: ${err.message}`)); 
        CustomActivity.initAll().catch(err => console.log(`Ошибка загрузки кастомных сборов по готовности: ${err.message}`));
    },
};