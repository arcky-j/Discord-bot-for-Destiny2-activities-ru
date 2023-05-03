const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
//команда контекстного меню для записи пользователя в кэш
module.exports = {
    data: new ContextMenuCommandBuilder()
            .setName('register')
            .setType(ApplicationCommandType.User)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        const user = interaction.targetUser;
        //записывает пользователя в кэш бота. всё
        const pathToGuardians = path.join('.', 'data', 'guardians', `guild_${interaction.guildId}`);
        if (!fs.existsSync(pathToGuardians)){
            fs.mkdirSync(pathToGuardians, {recursive: true});
            console.log(`Создана директория ${pathToGuardians}`);
        }
        const data = {member: interaction.targetMember.id};
        const js = JSON.stringify(data);
        fs.writeFile(path.join(pathToGuardians, `guardian_${interaction.targetMember.id}.json`), js, (error) =>{
            if (error){
                console.error(error);
                settings.sendLog(`Не удалось сохранить в файл ${interaction.targetMember}: ${error.message}`, 'Запись логов: ошибка');
            }
        });
        interaction.reply({content: `Вы успешно зарегистрировали ${user}. т.е. записали в кэш.`, ephemeral:true});
    }
};