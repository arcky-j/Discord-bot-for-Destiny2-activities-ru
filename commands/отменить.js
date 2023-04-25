const {SlashCommandBuilder} = require('discord.js');
const ActivityUntimed = require('../entities/activityUntimed');
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
        const channel = interaction.channel;
        const user = interaction.user;
        const client = interaction.client;
        //поиск нужной боевой группы
        const fireteam = client.fireteams.get(id);
        
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
        fireteam.sendAlerts('del');
        //удаление сообщения
        if (reason) {
            const embed = interaction.client.genEmbed(`Сбор в ${fireteam.name} (ID: ${id}) успешно удалён!\nПричина: ${reason}`, 'Успех!');
            await interaction.reply({embeds: [embed]});
        } else {
            const embed = interaction.client.genEmbed(`Сбор в ${fireteam.name} (ID: ${id}) успешно удалён!`, 'Успех!');
            await interaction.reply({embeds: [embed]});
        }  
        //запись уведомления в логи
        const logMess = await interaction.fetchReply();
        setTimeout(() => {
            logMess.delete().catch(err => console.log('Ошибка удаления сообщения лога удаления сбора (каво?): ' + err.message));
        }, 86400000);
        fireteam.message.delete();    
    }
};