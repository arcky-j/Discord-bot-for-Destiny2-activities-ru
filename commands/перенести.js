const {SlashCommandBuilder, Activity} = require('discord.js');
const ActivityUntimed = require('../entities/activityUntimed.js');
const setDate = require('../utility/date_set.js');
//команда для переноса активности на новое время
module.exports = {
    data: new SlashCommandBuilder()
        .setName('перенести')
        .setDescription('Переносит ваш уже созданный сбор на другое время')        
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID изменяемой активности')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('время')
                .setDescription('Новое время начала сбора по мск в формате "ЧЧ:ММ"')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('дата')
                .setDescription('Новая дата сбора в формате "ДД.ММ". Оставьте пустым для сегодняшней даты')
                .setRequired(false))
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
        const fireteam = interaction.client.activities.get(id);
        if (fireteam instanceof ActivityUntimed){
            const embed = interaction.client.genEmbed(`Попытка перенести активность, где даты-времени нет в принципе, не пройдёт`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        if (!fireteam || fireteam.state == 'Закрыт'){
            const embed = interaction.client.genEmbed(`Неверный ID. Возможно, активность уже началась`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        if (fireteam.leader.id != user.id){ //проверка на лидерство
            const embed = interaction.client.genEmbed(`Только лидер может перенести сбор`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        //установка новой даты через специальный метод
        let rDate;
        try {
            rDate = setDate(time, date);
        } catch (err) {
            const embed = interaction.client.genEmbed(`Не удалось установить дату: ${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }   
        //попытка дату сменить
        try {
            fireteam.changeDate(rDate);
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        //рассылка уведомлений
        if (reason){
            const embed = interaction.client.genEmbed(`Сбор ${fireteam} был успешно перенесён на ${fireteam.getDateString()}!\nПричина: ${reason}`, 'Успех!');
            interaction.reply({embeds: [embed]});
        } else {
            const embed = interaction.client.genEmbed(`Сбор ${fireteam} был успешно перенесён на ${fireteam.getDateString()}!`, 'Успех!');
            interaction.reply({embeds: [embed]});
        }
        //загрузка сообщения в логи
        const logMess = await interaction.fetchReply();
        setTimeout(() => {
            logMess.delete().catch(async err => {
                console.log('Ошибка удаления лога переноса сбора: ' + err.message)
                if (interaction.guildId){
                    const sett = interaction.client.settings.get(interaction.guildId);
                    sett.sendLog(`Ошибка удаления лога переноса сбора: ${err.message}`, 'Запись логов: ошибка');
                }
            });
        }, 86400000);
    }
}