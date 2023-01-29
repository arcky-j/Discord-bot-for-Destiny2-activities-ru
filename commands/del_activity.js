const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
//команда для удаления сбора
module.exports = {
    data: new SlashCommandBuilder()
        .setName('del_activity')
        .setDescription('Админская команда для удаления любого сбора')
        .addStringOption(option => 
            option.setName('id')
                .setDescription('ID удаляемой активности')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('причина')
                .setDescription('причина удаления активности')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        const id = interaction.options.getString('id');
        const reason = interaction.options.getString('причина');
        //поиск боевой группы
        const fireteam = interaction.client.fireteams.get(id);
        if (!fireteam){
            await interaction.reply({content: `ID введён некорректно! Или такой активности нет, или она началась и сообщение скоро удалится автоматически.`, ephemeral:true});
            return;
        }

        if (fireteam.isAlerted){
            interaction.client.timer.fireteamsStarted.delete(id);
        }
        //попытка удаления сообщения с последующим уведомлением
        try {
            interaction.channel.messages.delete(id);
            await interaction.channel.send(`Сбор ${fireteam.name} (ID: ${fireteam.id}) был удалён администратором ${interaction.user.tag} по причине: ${reason}`);
            const lastMess = interaction.channel.lastMessage;
            fireteam.sendAlerts('admin_del');
            interaction.client.timer.logMessages.set(lastMess.id, lastMess);
            interaction.client.fireteams.delete(id);
        } catch (err){
            await interaction.reply({content: `Непредвиденная ошибка: ${err.message}`, ephemeral:true});
        }
        
        await interaction.reply({content: `Активность была удалена. Её участники оповещены.`, ephemeral:true});

    }
}