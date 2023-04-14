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
            await interaction.reply({content:'Неверный ID. Возможно, активность уже началась и в скором времени удалится сама', ephemeral: true});
            return;                        
        }

        if (fireteam.leaderId != user.id){ //проверка на лидерство
            await interaction.reply({content:'Ты же не лидер, чтобы это удалить', ephemeral: true});
            return;
        }
        fireteam.sendAlerts('del');
        //удаление сообщения
        if (reason) {
            await interaction.reply({content:`Сбор в ${fireteam.name} (ID: ${id}) успешно удалён!\nПричина: ${reason}`});
        } else {
            await interaction.reply({content:`Сбор в ${fireteam.name} (ID: ${id}) успешно удалён!`});
        }  
        //запись уведомления в логи
        const logMess = await interaction.fetchReply();
        setTimeout(() => {
            try{
                logMess.delete();
            } catch (err){
                console.log('Ошибка удаления сообщения лога удаления сбора (каво?): ' + err.message);
            }
        }, 86400000);
        // fireteam.state = 'Закрыт';
        // fireteam.refreshMessage();
        fireteam.message.delete();
        //удаление всех данных и рассылка уведомлений 
        // try {
        //     client.fireteams.delete(id);
        // } catch (err){
        //     console.log('гитара');
        // }       
    }
};