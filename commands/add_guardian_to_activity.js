const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
//команда для ручного добавления Стража в боевую группу
module.exports = {
    data: new SlashCommandBuilder()
            .setName('add_guardian_to_activity')
            .setDescription('Записать Стража вручную, если есть такая потребность')
            .addUserOption(option =>
                option.setName('пользователь')
                    .setDescription('Пользователь, которого вы хотите добавить. Начните вводить его ник и выберите из списка.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('id')
                    .setDescription('ID активности для записи')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        const id = interaction.options.getString('id');
        const userNew = interaction.options.getUser('пользователь');
        const channel = interaction.channel;
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
        userNew.send(`Вы были записаны в активность ${fireteam.name} на ${fireteam.getDateString()} администратором ${interaction.user.tag}`);
        //редактирование сообщения
        const message = await channel.messages.fetch(id);
        const embed = message.embeds[0];
        embed.fields[1].value = fireteam.getMembersString();
        embed.fields[2].value = fireteam.getReservsString();
        message.edit({embeds: [embed]});
        fireteam.setEmbed(embed);
        await interaction.reply({content: 'Вы успешно записали Стража в группу!', ephemeral:true});
    }
};