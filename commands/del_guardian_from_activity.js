const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
//команда для ручного удаления Стража из сбора
module.exports = {
    data: new SlashCommandBuilder()
            .setName('del_guardian_from_activity')
            .setDescription('Удалить Стража вручную, если есть такая потребность')
            .addUserOption(option =>
                option.setName('пользователь')
                    .setDescription('Пользователь, которого вы хотите удалить. Начните вводить его ник и выберите из списка.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('id')
                    .setDescription('ID активности для удаления')
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
        const message = await channel.messages.fetch(id);
        const embed = message.embeds[0];
        embed.fields[1].value = fireteam.getMembersString();
        embed.fields[2].value = fireteam.getReservsString();
        message.edit({embeds: [embed]});
        await interaction.reply({content: 'Вы успешно удалили Стража из группы!', ephemeral:true});
    }
};