const {Events, EmbedBuilder, GuildFeature} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
//срабатывает при вступлении пользователя на сервер
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const settings = member.client.settings.get(member.guild.id);
        if (!settings){
            return;
        }
        if (settings.channelJoin){
            settings.sendJoinAlert(member); //оповещает о прибытии
        }
        if (settings.rolesForNew.length > 0 && !member.guild.features.includes(GuildFeature.MemberVerificationGateEnabled)){
            member.roles.add(settings.rolesForNew).catch(err => {
                console.log(`Ошибка с присвоением роли новичку сервера (${member.user.tag}): ${err.message}`);               
                const sett = member.client.settings.get(member.guild.id);
                sett.sendLog(`Не удалось присвоить роль/роли новичку сервера (${member}): ${err.message}`, 'Запись логов: ошибка');           
            });
        }
        const pathToGuardians = path.join('.', 'data', 'guardians', `guild_${member.guild.id}`);
        if (!fs.existsSync(pathToGuardians)){
            fs.mkdirSync(pathToGuardians, {recursive: true});
            console.log(`Создана директория ${pathToGuardians}`);
        }
        const data = {member: member.id};
        const js = JSON.stringify(data);
        fs.writeFile(path.join(pathToGuardians, `guardian_${member.id}.json`), js, (error) =>{
            if (error){
                console.error(error);
                settings.sendLog(`Не удалось сохранить в файл ${member}: ${error.message}`, 'Запись логов: ошибка');
            }
        });
    },
};