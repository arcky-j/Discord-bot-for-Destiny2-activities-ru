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
                subcommand.setName('закрыть_голосование')
                    .setDescription('Принудительно закрыть любое голосование')
                    .addStringOption(option =>
                        option.setName('id')
                            .setDescription('ID закрываемого голосования')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('причина')
                            .setDescription('Причина силового закрытия голосования')
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
            const userNew = interaction.options.getUser('пользователь');
            const user = interaction.user;
            //поиск нужной боевой группы
            const fireteam = interaction.client.fireteams.get(id);
    
            if (!fireteam){
                await interaction.reply({content: 'Неверный ID. Возможно, активность уже началась', ephemeral:true});
                return;
            }
            //попытка добавления пользователя
            try{
                fireteam.memberAdd(userNew.id, userNew);
            } catch (err){
                await interaction.reply({content: err.message, ephemeral:true});
                return;
            }
            //личное уведомление пользователю
            userNew.send(`Вы были записаны в активность ${fireteam.name} на ${fireteam.getDateString()} администратором ${user.tag}`);
            //редактирование сообщения
            const embed = fireteam.refreshLists();
            fireteam.message.edit({embeds: [embed]});   
            await interaction.reply({content: 'Вы успешно записали Стража в группу!', ephemeral:true});
        }

        if (interaction.options.getSubcommand() === 'удалить_стража'){
            const userNew = interaction.options.getUser('пользователь');
            const user = interaction.user;
            //поиск нужной боевой группы
            const fireteam = interaction.client.fireteams.get(id);

            if (!fireteam){
                await interaction.reply({content: 'Неверный ID. Возможно, активность уже началась', ephemeral:true});
                return;
            }
            //попытка удаления члена группы
            try{
                fireteam.memberDel(userNew.id, userNew);
            } catch (err){
                await interaction.reply({content: err.message, ephemeral:true});
                return;
            }
            //оповещение пользователя
            userNew.send(`Вы были удалены из активности ${fireteam.name} на ${fireteam.getDateString()} администратором ${interaction.user.tag}`);
            //изменение сообщения
            const embed = fireteam.refreshLists();
            fireteam.message.edit({embeds: [embed]});
            await interaction.reply({content: 'Вы успешно удалили Стража из группы!', ephemeral:true});
        }

        if (interaction.options.getSubcommand() === 'закрыть_голосование'){
            const reason = interaction.options.getString('причина');
            const channel = interaction.channel;
            const user = interaction.user;
            const client = interaction.client;
            //поиск нужного голосования
            const poll = client.polls.get(id);

            if (!poll){
                await interaction.reply({content:'Неверный ID', ephemeral: true});
                return;                        
            }
            //формирование итогов
            const message = await channel.messages.fetch(id);
            const oldEmbed = message.embeds[0];
            const embed = new EmbedBuilder()
            .setTitle(oldEmbed.title)
            .setDescription(`Голосование было закрыто администратором ${user.tag}!\nПричина: ${reason}`)
            .addFields(oldEmbed.fields)
            .setColor(oldEmbed.color)
            .setThumbnail(oldEmbed.thumbnail.url)
            .setFooter({text: `Автор голосования: ${poll.creator.tag}`});
            //удаление исходного сообщения и отправка итогов
            try {
                await channel.messages.delete(id);
                await channel.send({embeds: [embed]});
            } catch (err){
                await interaction.reply({content:err.message, ephemeral: true});
            }       
            //удаление данных
            client.polls.delete(id);
            interaction.reply({content:'Вы успешно закрыли голосование!', ephemeral: true});
        }

        if (interaction.options.getSubcommand() === 'удалить_сбор'){
            const reason = interaction.options.getString('причина');
            //поиск боевой группы
            const fireteam = interaction.client.fireteams.get(id);
            if (!fireteam){
                await interaction.reply({content: `ID введён некорректно! Или такой активности нет, или она началась и сообщение скоро удалится автоматически.`, ephemeral:true});
                return;
            }
            //попытка удаления сообщения с последующим уведомлением
            try {
                interaction.channel.messages.delete(fireteam.message.id);
                await interaction.channel.send(`Сбор ${fireteam.name} (ID: ${fireteam.id}) был удалён администратором ${interaction.user.tag} по причине: ${reason}`);
                const lastMess = interaction.channel.lastMessage;
                fireteam.sendAlerts('admin_del');
                setTimeout(() => {
                    try{
                        lastMess.delete();
                    } catch (err){
                        console.log('Ошибка удаления сообщения лога удаления сбора (каво?): ' + err.message);
                    }
                }, 86400000);
                fireteam.state = 'Закрыт';
                fireteam.refreshMessage();
            } catch (err){
                await interaction.reply({content: `Непредвиденная ошибка: ${err.message}`, ephemeral:true});
                return;
            }
            
            await interaction.reply({content: `Активность была удалена. Её участники оповещены.`, ephemeral:true});
        }
    }
};