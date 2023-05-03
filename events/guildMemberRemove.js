const {Events} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
//срабатывает при уходе пользователя с сервера
module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const client = member.client;
        const settings = client.settings.get(member.guild.id);
        if (!settings){
            return;
        }
        if (settings.channelLeave){           
            settings.sendLeaveAlert(member);
        }           
        const pathToGuardians = path.join('.', 'data', 'guardians', `guild_${member.guild.id}`);
        if (!fs.existsSync(pathToGuardians)){
            fs.mkdirSync(pathToGuardians, {recursive: true});
        }
        fs.unlink(path.join(pathToGuardians, `guardian_${member.id}.json`), (error) =>{
            if (error){
                console.error(error);
                settings.sendLog(`Не удалось удалить файл с ${member}: ${error.message}`, 'Запись логов: ошибка');
            }
        });
    },
};