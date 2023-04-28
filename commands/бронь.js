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
            const embed = interaction.client.genEmbed(`Неверный ID. Возможно, активность уже началась`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        //проверка на лидерство
        if (user.id != fireteam.leader.id){
            const embed = interaction.client.genEmbed(`Только лидер может управлять бронью сбора!`, 'Ошибка!');
            interaction.reply({embeds: [embed], ephemeral:true});
            return;
        }
        
        if (interaction.options.getSubcommand() === 'добавить'){
            try {
                await fireteam.bronAdd(userNew);
                const embed = interaction.client.genEmbed(`Вы успешно забронировали место для ${userNew}!`, 'Успех!');
                interaction.reply({embeds: [embed], ephemeral:true}); 
            } catch (err) {
                const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
            }    
        }
        //попытка удаления пользователя
        if (interaction.options.getSubcommand() === 'удалить'){
            try {
                await fireteam.bronDel(userNew.id);
                const embed = interaction.client.genEmbed(`Вы успешно отозвали бронь для ${userNew}!`, 'Успех!');
                interaction.reply({embeds: [embed], ephemeral:true});
            } catch (err) {
                const embed = interaction.client.genEmbed(`${err.message}`, 'Ошибка!');
                interaction.reply({embeds: [embed], ephemeral:true});
            }                     
        }       
    }
};