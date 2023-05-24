const {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');
//команда для управления ботом
module.exports = {
    data: new SlashCommandBuilder()
        .setName('настроить')
        .setDescription('Команда для управления ботом')
        .addSubcommand(subcommand =>
            subcommand
                .setName('роли_для_сборов')
                .setDescription('Установить до пяти ролей, упоминаемых в сборах')
                .addRoleOption(option => 
                    option
                        .setName('роль1')
                        .setDescription('Первая роль'))
                .addRoleOption(option => 
                    option
                        .setName('роль2')
                        .setDescription('Вторая роль'))
                .addRoleOption(option => 
                    option
                        .setName('роль3')
                        .setDescription('Третья роль'))
                .addRoleOption(option => 
                    option
                        .setName('роль4')
                        .setDescription('Четвёртая роль'))
                .addRoleOption(option => 
                    option
                        .setName('роль5')
                        .setDescription('Пятая роль')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('роли_для_новичков')
                .setDescription('Установить до трёх ролей, выдаваемых новичкам сервера')
                .addRoleOption(option => 
                    option
                        .setName('роль1')
                        .setDescription('Первая роль'))
                .addRoleOption(option => 
                    option
                        .setName('роль2')
                        .setDescription('Вторая роль'))
                .addRoleOption(option => 
                    option
                        .setName('роль3')
                        .setDescription('Третья роль')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('каналы_уведомлений')
                .setDescription('Назначить каналы для уведомлений о новоприбывших и ушедших')
                .addChannelOption(option => 
                    option
                        .setName('канал_прибывших')
                        .setDescription('Канал для уведомлений о прибытии на сервер'))
                .addChannelOption(option => 
                    option
                        .setName('канал_ушедших')
                        .setDescription('Канал для уведомлений об уходе с сервера')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('канал_логов')
                .setDescription('Назначить канал для уведомлений бота')
                .addChannelOption(option => 
                    option
                        .setName('канал_для_логов')
                        .setDescription('Канал для уведомлений')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('уведомления')
                .setDescription('Настройка сообщений, уведомляющих о прибытии и уходе'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'роли_для_сборов'){
            const role1 = interaction.options.getRole('роль1');
            const role2 = interaction.options.getRole('роль2');
            const role3 = interaction.options.getRole('роль3');
            const role4 = interaction.options.getRole('роль4');
            const role5 = interaction.options.getRole('роль5');
            const sett = interaction.client.d2clans.getConfig(interaction.guild.id);
            sett.setRoleTags(role1, role2, role3, role4, role5);
            //если первая роль не введена, то роли сбрасываются
            if (!role1){
                const embed = interaction.client.genEmbed(`Вы не выбрали ни одной роли`, 'Успех! Роли для сборов сброшены');
                interaction.reply({embeds: [embed]});
                return;
            } 
            const rat = [];
            rat.push(role1);
            if (role2){
                rat.push(role2);
            }
            if (role3){
                rat.push(role3);
            }
            if (role4){
                rat.push(role4);
            }
            if (role5){
                rat.push(role5);
            }
            let str = '';
            rat.forEach((val) =>{
                str += `${val}\n`;
            });
            //оповещает о проделанной работе
            const embed = interaction.client.genEmbed(`${str}`, 'Успех! Роли для сборов установлены');
            interaction.reply({embeds: [embed]}); 
            return;       
        }

        if (interaction.options.getSubcommand() === 'роли_для_новичков'){
            const role1 = interaction.options.getRole('роль1');
            const role2 = interaction.options.getRole('роль2');
            const role3 = interaction.options.getRole('роль3');
            const sett = interaction.client.d2clans.getConfig(interaction.guild.id);
            sett.setRolesForNew(role1, role2, role3);
            //если первая роль не введена, то роли сбрасываются
            if (!role1){
                const embed = interaction.client.genEmbed(`Вы не выбрали ни одной роли`, 'Успех! Роли для новичков сервера сброшены');
                interaction.reply({embeds: [embed]});
                return;
            } 
            const rat = [];
            rat.push(role1);
            if (role2){
                rat.push(role2);
            }
            if (role3){
                rat.push(role3);
            }
            let str = '';
            rat.forEach((val) =>{
                str += `${val}\n`;
            });

            //оповещает о проделанной работе
            const embed = interaction.client.genEmbed(`${str}`, 'Успех! Роли для новичков сервера установлены');
            interaction.reply({embeds: [embed]});       
            return;
        }

        if (interaction.options.getSubcommand() === 'каналы_уведомлений'){
            const channelJ = interaction.options.getChannel('канал_прибывших');
            const channelL = interaction.options.getChannel('канал_ушедших');
            const sett = interaction.client.d2clans.getConfig(interaction.guild.id);
            sett.setJLChannels(channelJ, channelL);
            //если чат не введён, то он просто сбрасывается
            if (!channelJ && !channelL){
                const embed = interaction.client.genEmbed(`Вы не выбрали ни одного канала`, 'Успех! Каналы оповещений сброшены');
                interaction.reply({embeds: [embed]});
                return;
            }
            if (channelJ && channelL){
                const embed = interaction.client.genEmbed(`${channelJ} - канал для уведомлений о новоприбывших и ${channelL} - канал уведомлений о ушедших`, 'Успех! Каналы оповещений установлены');
                interaction.reply({embeds: [embed]});
                return;
            }
            if (channelJ){
                const embed = interaction.client.genEmbed(`${channelJ} - канал для уведомлений о новоприбывших`, 'Успех! Каналы оповещений установлены');
                interaction.reply({embeds: [embed]});
                return;
            }
            if (channelL){
                const embed = interaction.client.genEmbed(`${channelL} - канал уведомлений о ушедших`, 'Успех! Каналы оповещений установлены');
                interaction.reply({embeds: [embed]});
                return;
            }
            
        }

        if (interaction.options.getSubcommand() === 'канал_логов'){
            const channel = interaction.options.getChannel('канал_для_логов');
            const sett = interaction.client.d2clans.getConfig(interaction.guild.id);
            sett.setLogChannel(channel);
            //если чат не введён, то он просто сбрасывается
            if (!channel){
                const embed = interaction.client.genEmbed(`Вы не выбрали ни одного канала`, 'Успех! Канал для логов бота сброшен');
                interaction.reply({embeds: [embed]});
                return;
            }
            if (channel){
                const embed = interaction.client.genEmbed(`${channel}`, 'Успех! Канал оповещений бота установлен');
                interaction.reply({embeds: [embed]});
                return;
            }
        }
        
        if (interaction.options.getSubcommand() === 'уведомления'){
            const modal = new ModalBuilder()
            .setTitle('Настройка сообщений')
            .setCustomId('messJL_modal');

            const messJ = new TextInputBuilder()
                .setCustomId('messJ')
                .setLabel('Уведомление при входе (# - ник)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            const messA = new TextInputBuilder()
                .setCustomId('messA')
                .setLabel('Уведомление о принятии правил (# - ник)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            const messL = new TextInputBuilder()
                .setCustomId('messL')
                .setLabel('Уведомление при уходе (# - ник)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            const row0 = new ActionRowBuilder().addComponents(messJ);
            const row1 = new ActionRowBuilder().addComponents(messA);
            const row2 = new ActionRowBuilder().addComponents(messL);

            modal.addComponents(row0, row1, row2);
            //отправка формы пользователю
            await interaction.showModal(modal);
            const filter = inter => inter.user.id === interaction.user.id && inter.customId === 'messJL_modal';
            const modalInt = await interaction.awaitModalSubmit({filter, time: 600000})
            .catch(error => console.log(error));

            //получает значения из всплывающего окна
            const messJfield = modalInt.fields.getTextInputValue('messJ');
            const messAfield = modalInt.fields.getTextInputValue('messA');
            const messLfield = modalInt.fields.getTextInputValue('messL');
            //загружает информацию в объект, отвечающий за ресет
            const sett = interaction.client.d2clans.getConfig(interaction.guild.id);
            sett.setJALMessages(messJfield, messAfield, messLfield);

            const embed = new EmbedBuilder().setTitle('Текста уведомлений о прибытии, принятии правил и уходе обновлены').setDescription(`Уведомление о прибытии: ${messJfield}\nУведомление о принятии правил: ${messAfield}\nУведомление о уходе: ${messLfield}`);
            await modalInt.reply({embeds: [embed]});
        }
    }
}