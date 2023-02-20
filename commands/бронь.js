const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
//команда для управления бронёй в сборах
module.exports = {
    data: new SlashCommandBuilder()
            .setName('бронь')
            .setDescription('Записать Стража вручную, если есть такая потребность')
            .addSubcommand(subcommand =>
                subcommand.setName('добавить')
                    .setDescription('Забронировать место для Стража')
                    .addUserOption(option =>
                        option.setName('пользователь')
                            .setDescription('Пользователь, которому вы хотите забронировать место')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('id')
                            .setDescription('ID активности')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand.setName('удалить')
                    .setDescription('Удалить бронь для Стража')
                    .addUserOption(option =>
                        option.setName('пользователь')
                            .setDescription('Пользователь, чью бронь вы хотите отозвать')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('id')
                            .setDescription('ID активности')
                            .setRequired(true))),

    async execute (interaction){
        const id = interaction.options.getString('id');
        const userNew = interaction.options.getUser('пользователь');
        const user = interaction.user;
        //поиск нужной боевой группы
        const fireteam = interaction.client.fireteams.get(id);

        if (!fireteam){
            await interaction.reply({content: 'Неверный ID. Возможно, активность уже началась', ephemeral:true});
            return;
        }
        //проверка на лидерство
        if (user.id != fireteam.leaderId){
            await interaction.reply({content: 'Только лидер может управлять бронью сбора!', ephemeral:true});
            return;
        }
        //попытка добавления пользователя
        if (interaction.options.getSubcommand() === 'добавить'){
            try{
                fireteam.bronAdd(userNew.id, userNew);
            } catch (err){
                await interaction.reply({content: err.message, ephemeral:true});
                return;
            }
            //редактирование сообщения
            await interaction.reply({content: 'Вы успешно забронировали место Стражу!', ephemeral:true});
        }
        //попытка удаления пользователя
        if (interaction.options.getSubcommand() === 'удалить'){
            try{
                fireteam.bronDel(userNew.id);
            } catch (err){
                await interaction.reply({content: err.message, ephemeral:true});
                return;
            }
            //редактирование сообщения
            await interaction.reply({content: 'Вы успешно отозвали бронь Стража!', ephemeral:true});
        }       
    }
};