const {Settings, ClanManager, getRandomPresence} = require('../fireteams_module');
const {Events} = require('discord.js');
//срабатывает при запуске бота
module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        //оповещает в консоли, ставит первый статус и подгружает нужные кэши
        //console.log(`${client.user.tag} на связи и готов фаршмачить`);
        client.user.setPresence({activities: [{name: 'побег из микроволновки', type: 0}]}); //напоминаю, что все статусы созданы под образ босса Шпиля Хранителя и их всегда можно поменять  
        setInterval(async () => {
            client.user.setPresence(getRandomPresence());
        }, 3600000);//3600000
        client.d2clans = new ClanManager();
    },
};