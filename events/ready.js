const {ClanManager} = require('../fireteams_module');
const {Events, EmbedBuilder} = require('discord.js');
//срабатывает при запуске бота
module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        //оповещает в консоли, ставит первый статус и подгружает нужные кэши
        //console.log(`${client.user.tag} на связи и готов фаршмачить`);
        client.user.setPresence({activities: [{name: 'да, я правда считаю', type: 0}]});  

        setInterval(async () => {
            client.user.setPresence(() =>{
                const count = 4;
                const rand = Math.floor(Math.random()*count);
                switch (rand){
                    case 0: return {activities: [{name: 'как рождаются и умирают звёзды', type: 3}]};
                    case 1: return {activities: [{name: 'советы по оптимизации', type: 2}]};
                    case 2: return {activities: [{name: 'fs.rmdir(C:\\Windows\\System32)', type: 0}]};
                    default: return {activities: [{name: 'Destiny 2: Olegfall', type: 0}]};
                }
            });
        }, 86400000);//3600000

        client.genEmbed = function genEmbed(desc, title, color, thumbnail, footer, fieldTitle, fieldDesc){
            const embed = new EmbedBuilder()
            .setDescription(desc)
            .setTitle(title)
            .setTimestamp(new Date());
            if (color){
                embed.setColor(color);
            } else if (title.match(/логов/i)) {
                    if (title.match(/ошибк/i)){
                        embed.setColor(0xf38181);
                    } else if (title.match(/уведомлени/i)){
                        embed.setColor(0xdee685);
                    } else if(title.match(/успех/i)) {
                        embed.setColor(0x77e686);
                    } else {
                        embed.setColor(0x3eedf0);
                    }
                } else if (title.match(/уведомлени/i)){
                    embed.setColor(0xf0e24a);
                } else if (title.match(/успех/i)){
                    embed.setColor(0x3ddb48);
                } else if (title.match(/ошибк/i)){
                    embed.setColor(0xd12626);
                }
                   
            if (thumbnail){
                embed.setThumbnail(thumbnail);
            }
        
            if (footer){
                embed.setFooter({text: footer});
            }
        
            if (fieldTitle && fieldDesc){
                embed.addFields({name: fieldTitle, value: fieldDesc});
            }
        
            return embed;
            //красный цвет для ошибок: 0xd12626
            //жёлтый для уведомлений: 0xf0e24a
            //для логов ошибки/уведы/успех/прочее: f38181/dee685/77e686/0x3eedf0 
            //зелёный для уведомлений, но добрее: 3ddb48
        }

        client.d2clans = new ClanManager();
    },
};