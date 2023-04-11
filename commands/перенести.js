const {SlashCommandBuilder, Activity} = require('discord.js');
const ActivityUntimed = require('../entities/activityUntimed.js');
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
        const user = interaction.user;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(id);
        if (fireteam instanceof ActivityUntimed){
            await interaction.reply({content: `Попытка перенести активность, где даты-времени нет в принципе, не пройдёт`, ephemeral: true});
            return;
        }
        if (!fireteam || fireteam.state == 'Закрыт'){
            await interaction.reply({content: `Неверный ID. Возможно, активность уже началась`, ephemeral: true});
            return;
        }
        if (fireteam.leaderId != user.id){ //проверка на лидерство
            await interaction.reply({content:'Только лидер может перенести сбор', ephemeral: true});
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
            fireteam.changeDate(rDate);
        } catch (err){
            await interaction.reply({content: err.message, ephemeral:true});
            return;
        }
        //рассылка уведомлений
        if (reason){
            interaction.reply({content: `Сбор ${fireteam.name} ID (${id}) был успешно пересён на ${fireteam.getDateString()}!\nПричина: ${reason}`});
        } else {
            interaction.reply({content: `Сбор ${fireteam.name} ID (${id}) был успешно пересён на ${fireteam.getDateString()}!`});
        }
        //загрузка сообщения в логи
        const logMess = await interaction.fetchReply();
        setTimeout(() => {
            try{
                logMess.delete();
            } catch (err){
                console.log('Ошибка удаления лога переноса сбора: ' + err.message);
            }
        }, 86400000);
    }
}