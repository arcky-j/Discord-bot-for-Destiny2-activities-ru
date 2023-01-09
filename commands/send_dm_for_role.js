const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
//команда для рассылки личных сообщений конкретной роли
module.exports = {
    data: new SlashCommandBuilder()
            .setName('send_dm_for_role')
            .setDescription('Сделать личную рассылку для определённой роли')
            .addRoleOption(option =>
                option.setName('роль')
                    .setDescription('Роль, которой вы хотите сделать личную рассылку. Начните вводить название роль и выберите из списка.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('сообщение')
                    .setDescription('Отправляемое сообщение')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute (interaction){
        const message = interaction.options.getString('сообщение');
        const role = interaction.options.getRole('роль');
        const user = interaction.user;
        let count = 0;
        try{
            role.members.forEach((mem) => {
                mem.send(`Вы получаете эту автоматическую рассылку, так как имеете роль **${role.name}** на сервере **${role.guild}**. Автор рассылки: ${user.tag}. Сообщение:\n${message}`);
                count++;
            });
        } catch (err){
            await interaction.reply({content: `Непредвиденная ошибка: ${err.message}`, ephemeral:true});
            return;
        }

        await interaction.reply({content: `Вы успешно сделали рассылку ${count} людям!`, ephemeral:true});
    }
};