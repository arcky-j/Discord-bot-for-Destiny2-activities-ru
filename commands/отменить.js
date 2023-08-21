const {SlashCommandBuilder} = require('discord.js');
//команда для отмены существующего сбора
module.exports = {
    data: new SlashCommandBuilder()
            .setName('отменить')
            .setDescription('Отмена существующего сбора')
            .addStringOption(option =>
                option.setName('id')
                    .setDescription('ID удаляемой активности')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('причина')
                    .setDescription('Если считаете нужным, укажите причину отмены')),

    async execute (interaction){
        //получение данных из команды
        const id = interaction.options.getString('id');
        const reason = interaction.options.getString('причина');
        const user = interaction.member;
        const client = interaction.client;
        //поиск нужной боевой группы
        const fireteam = client.d2clans.getActivity(interaction.guildId, id);
        
        if (!fireteam || fireteam.state == 'Закрыт'){
            const embed = interaction.client.genEmbed(`Неверный ID. Возможно, активность уже началась и в скором времени удалится сама`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;                        
        }

        if (fireteam.leader.id != user.id){ //проверка на лидерство
            const embed = interaction.client.genEmbed(`Только лидер может отменить сбор!`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        fireteam.cancel();
        //удаление сообщения
        if (reason) {
            const embed = interaction.client.genEmbed(`Сбор ${fireteam} успешно отменён!\nПричина: ${reason}`, 'Успех!');
            interaction.reply({embeds: [embed]});
        } else {
            const embed = interaction.client.genEmbed(`Сбор ${fireteam} успешно отменён!`, 'Успех!');
            interaction.reply({embeds: [embed]});
        }  
        //запись уведомления в логи
        const logMess = await interaction.fetchReply();
        setTimeout(() => {
            logMess.delete().catch(async err => {
                console.log('Ошибка удаления сообщения лога удаления сбора (каво?): ' + err.message)
                if (interaction.guildId){
                    const sett = interaction.client.settings.get(interaction.guildId);
                    sett.sendLog(`Ошибка удаления сообщения лога удаления сбора (каво?): ${err.message}`, 'Запись логов: ошибка');
                }
            });
        }, 86400000);  
    }
};