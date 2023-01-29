const {SlashCommandBuilder} = require('discord.js');
const setDate = require('../utility/date_set.js');
//команда для переноса активности на новое время
module.exports = {
    data: new SlashCommandBuilder()
        .setName('перенести')
        .setDescription('Переносит ваш уже созданный сбор на другое время')
        .addStringOption(option => 
            option.setName('время')
                .setDescription('Новое время начала сбора по мск в формате "ЧЧ:ММ"')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('дата')
                .setDescription('Новая дата сбора в формате "ДД.ММ"')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID изменяемой активности')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('причина')
                .setDescription('Если считаете нужным, укажите причину переноса')),

    async execute(interaction){
        //получение данных из команды
        const time = interaction.options.getString('время');
        const date = interaction.options.getString('дата');
        const id = interaction.options.getString('id');
        const reason = interaction.options.getString('причина');
        const channel = interaction.channel;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(id);
        if (!fireteam){
            await interaction.reply({content: `Неверный ID. Возможно, активность уже началась`, ephemeral: true});
            return;
        }
        let rDate;
        //установка новой даты через специальный метод
        try {
            rDate = setDate(time, date);
        } catch (err){
            await interaction.reply({content: err.message, ephemeral:true});
            return;
        }
        //попытка дату сменить
        try{
            fireteam.changeDate(interaction.user.id, rDate);
        } catch (err){
            await interaction.reply({content: err.message, ephemeral:true});
            return;
        }
        //редактирование сообщения со сбором
        const message = await channel.messages.fetch(id);
        const embed = message.embeds[0];
        embed.fields[0].value = fireteam.getDateString();
        message.edit({embeds: [embed]});
        fireteam.setEmbed(embed);
        //рассылка уведомлений
        fireteam.sendAlerts('dateChange');
        //если оповещение о начале сбора было, отправить его потом снова
        if (fireteam.isAlerted){
            fireteam.isAlerted = false;
            interaction.client.timer.fireteamsStarted.delete(fireteam.id);
        }
        if (reason){
            interaction.reply({content: `Сбор ${fireteam.name} ID (${id}) был успешно пересён на ${fireteam.getDateString()}!\nПричина: ${reason}`});
        } else {
            interaction.reply({content: `Сбор ${fireteam.name} ID (${id}) был успешно пересён на ${fireteam.getDateString()}!\nПричина не указана.`});
        }
        //загрузка сообщения в логи
        const logMess = await interaction.fetchReply();
        interaction.client.timer.logMessages.set(logMess.id, logMess);
    }
}