const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
//команда для передачи лидерства
module.exports = {
    data: new SlashCommandBuilder()
            .setName('передать')
            .setDescription('Передача лидерства в существующем сборе')
            .addStringOption(option =>
                option.setName('id')
                    .setDescription('ID изменяемой активности')
                    .setRequired(true))
            .addUserOption(option =>
                option.setName('пользователь')
                    .setDescription('Пользователь, которому вы хотите передать лидерство. Начните вводить его ник и выберите из списка.')
                    .setRequired(true))           
            .addStringOption(option =>
                option.setName('причина')
                    .setDescription('Если считаете нужным, укажите причину передачи лидерства')),

    async execute (interaction){
        //получение данных из команды
        const id = interaction.options.getString('id');
        const userNew = interaction.options.getMember('пользователь');
        const reason = interaction.options.getString('причина');
        const user = interaction.member;
        //поиск нужной боевой группы
        const activity = interaction.client.d2clans.getActivity(interaction.guildId, id);

        if (!activity){
            const embed = interaction.client.genEmbed(`Неверный ID. Возможно, активность уже началась`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        if (activity.leader.id != user.id){ //проверка на лидерство
            const embed = interaction.client.genEmbed(`Только лидер может управлять сбором`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        //попытка передачи лидерства
        try {
            activity.changeLeader(userNew);
        } catch (err) {
            const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        //уведомление в чат сбора
        if (reason){
            const embed = interaction.client.genEmbed(`В сборе ${activity} сменился Лидер! ${user} => ${userNew}\nПричина: ${reason}`, 'Уведомление');
            interaction.reply({embeds: [embed]});
        } else {
            const embed = interaction.client.genEmbed(`В сборе ${activity} сменился Лидер! ${user} => ${userNew}`, 'Уведомление');
            interaction.reply({embeds: [embed]});
        }     
        //запись сообщения в логи
        const logMess = await interaction.fetchReply();
        setTimeout(() => {
            logMess.delete().catch(async err => {
                console.log('Ошибка удаления лога передачи сбора: ' + err.message)
                if (interaction.guildId){
                    const sett = interaction.client.settings.get(interaction.guildId);
                    sett.sendLog(`Ошибка удаления лога передачи сбора: ${err.message}`, 'Запись логов: ошибка');
                }
            });
        }, 86400000);
    }
};