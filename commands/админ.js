const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
//команда для админских действий со сборами
module.exports = {
    data: new SlashCommandBuilder()
            .setName('админ')
            .setDescription('Префикс для команд администратора')
            .addSubcommand(subcommand =>
                subcommand.setName('добавить_стража')
                    .setDescription('Силой добавить пользователя в любой сбор')
                    .addUserOption(option =>
                        option.setName('пользователь')
                            .setDescription('Пользователь, которого вы хотите добавить. Начните вводить его ник и выберите из списка.')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('id')
                            .setDescription('ID активности для записи')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand.setName('удалить_стража')
                    .setDescription('Силой удалить пользователя из любого сбора')
                    .addUserOption(option =>
                        option.setName('пользователь')
                            .setDescription('Пользователь, которого вы хотите удалить. Начните вводить его ник и выберите из списка.')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('id')
                            .setDescription('ID активности для удаления Стража')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand.setName('удалить_сбор')
                    .setDescription('Принудительно закрыть любой сбор')
                    .addStringOption(option => 
                        option.setName('id')
                            .setDescription('ID удаляемой активности')
                            .setRequired(true))
                    .addStringOption(option => 
                        option.setName('причина')
                            .setDescription('причина удаления активности')
                            .setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        const id = interaction.options.getString('id');
        //код при добавлении стража
        if (interaction.options.getSubcommand() === 'добавить_стража'){
            const userNew = interaction.options.getMember('пользователь');
            const user = interaction.member;
            //поиск нужной боевой группы
            const activity = interaction.client.d2clans.getActivity(interaction.guildId, id);
    
            if (!activity){
                const embed = interaction.client.genEmbed(`Неверный ID. Возможно, активность уже началась`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
                return;
            }
            //попытка добавления пользователя
            try {
                activity.add(userNew);
            } catch (err) {
                const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
                return;
            }
            const embedDM = interaction.client.genEmbed(`Вы были записаны в активность ${activity} администратором ${user}`, 'Уведомление');
            userNew.send({embeds: [embedDM]});         
            const embed = interaction.client.genEmbed(`Вы записали Стража в группу!`, 'Успех!');
            interaction.reply({embeds: [embed], ephemeral:true});
                  
        }

        if (interaction.options.getSubcommand() === 'удалить_стража'){
            const userNew = interaction.options.getMember('пользователь');
            const user = interaction.member;
            //поиск нужной боевой группы
            const activity = interaction.client.d2clans.getActivity(interaction.guildId, id);

            if (!activity){
                const embed = interaction.client.genEmbed(`Неверный ID. Возможно, активность уже началась`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
                return;
            }
            //попытка удаления члена группы
            try {
                activity.remove(userNew);
            } catch (err) {
                const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
                return;
            }
            //оповещение пользователя
            const embedDM = interaction.client.genEmbed(`Вы были удалены из активности ${activity} администратором ${user}`, 'Уведомление');
            userNew.send({embeds: [embedDM]});
            const embed = interaction.client.genEmbed(`Вы удалили Стража из группы!`, 'Успех!');
            interaction.reply({embeds: [embed], ephemeral:true});         
        }

        if (interaction.options.getSubcommand() === 'удалить_сбор'){
            const reason = interaction.options.getString('причина');
            //поиск боевой группы
            const activity = interaction.client.d2clans.getActivity(interaction.guildId, id);
            if (!activity){
                const embed = interaction.client.genEmbed(`Неверный ID. Возможно, активность уже началась`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
                return;
            }
            //попытка удаления сообщения с последующим уведомлением
            try {
                activity.adminCancel();
                const embed = interaction.client.genEmbed(`Сбор ${activity} был удалён администратором ${interaction.member} по причине: ${reason}`, 'Уведомление');
                interaction.channel.send({embeds: [embed]});
                const lastMess = interaction.channel.lastMessage;              
                setTimeout(() => {
                    lastMess.delete().catch(async err => {
                        console.log('Ошибка удаления сообщения лога удаления сбора (каво?): ' + err.message);
                        if (interaction.guildId){
                            const sett = interaction.client.settings.get(interaction.guildId);
                            sett.sendLog(`Ошибка удаления сообщения лога удаления сбора (каво?): ${err.message}`, 'Запись логов: ошибка');
                        }
                    });
                }, 86400000);
            } catch (err){
                const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
                return;
            }
            const embed = interaction.client.genEmbed(`Активность была удалена. Её участники оповещены.`, 'Успех!');
            interaction.reply({embeds: [embed], ephemeral:true});        
        }
    }
};