const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
//команда для передачи лидерства
module.exports = {
    data: new SlashCommandBuilder()
            .setName('передать')
            .setDescription('Передача лидерства в существующем сборе')
            .addUserOption(option =>
                option.setName('пользователь')
                    .setDescription('Пользователь, которому вы хотите передать лидерство. Начните вводить его ник и выберите из списка.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('id')
                    .setDescription('ID изменяемой активности')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('причина')
                    .setDescription('Если считаете нужным, укажите причину передачи лидерства')),

    async execute (interaction){
        //получение данных из команды
        const id = interaction.options.getString('id');
        const userNew = interaction.options.getUser('пользователь');
        const reason = interaction.options.getString('причина');
        const channel = interaction.channel;
        const user = interaction.user;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(id);

        if (!fireteam){
            await interaction.reply({content: 'Неверный ID. Возможно, активность уже началась', ephemeral:true});
            return;
        }
        //попытка передачи лидерства
        try{
            fireteam.changeLeader(user.id, userNew.id, userNew);
        } catch (err){
            await interaction.reply({content: err.message, ephemeral:true});
            return;
        }
        //обновление сообщения сбора
        const message = await channel.messages.fetch(id);
        const embed = message.embeds[0];
        embed.fields[1].value = fireteam.getMembersString();
        embed.fields[2].value = fireteam.getReservsString();
        message.edit({embeds: [embed]});
        fireteam.setEmbed(embed);
        //уведомление в чат сбора
        if (reason){
            await interaction.reply({content: `В сборе ${fireteam.name} (ID: ${id}) сменился Лидер! <@${user.id}> => <@${userNew.id}>\nПричина: ${reason}` });
        } else {
            await interaction.reply({content: `В сборе ${fireteam.name} (ID: ${id}) сменился Лидер! <@${user.id}> => <@${userNew.id}>\nПричина не указана.` });
        }     
        //запись сообщения в логи
        const logMess = await interaction.fetchReply();
        interaction.client.timer.logMessages.set(logMess.id, logMess);
    }
};