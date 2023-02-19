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
        const channel = interaction.channel;
        const user = interaction.user;
        const client = interaction.client;
        //поиск нужной боевой группы
        const fireteam = client.fireteams.get(id);

        if (!fireteam){
            await interaction.reply({content:'Неверный ID. Возможно, активность уже началась и в скором времени удалится сама', ephemeral: true});
            return;                        
        }

        if (fireteam.getLeaderId() != user.id){ //проверка на лидерство
            await interaction.reply({content:'Ты же не лидер, чтобы это удалить', ephemeral: true});
            return;
        }
        //удаление сообщения
        try {
            await channel.messages.delete(fireteam.message.id);
            if (reason) {
                await interaction.reply({content:`Сбор в ${fireteam.name} (ID: ${id}) успешно удалён!\nПричина: ${reason}`});
            } else {
                await interaction.reply({content:`Сбор в ${fireteam.name} (ID: ${id}) успешно удалён!\nПричина не указана`});
            }  
            //запись уведомления в логи
            const logMess = await interaction.fetchReply();
            interaction.client.timer.logMessages.set(logMess.id, logMess);          
        } catch (err){
            await interaction.reply({content:err.message, ephemeral: true});
        }       
        
        if (fireteam.isAlerted){
            interaction.client.timer.fireteamsStarted.delete(fireteam.id);
        }
        //удаление всех данных и рассылка уведомлений
        interaction.client.timer.actMessages.delete(id);          
        fireteam.sendAlerts('del');
        client.fireteams.delete(id);
    }
};