const {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits} = require('discord.js');
//команда для управления ботом
module.exports = {
    data: new SlashCommandBuilder()
        .setName('настроить')
        .setDescription('Команда для управления ботом. Без параметров просто покажет конфиг')
        .addSubcommand(subcommand =>
            subcommand
                .setName('роли_для_сборов')
                .setDescription('Установить до трёх ролей, упоминаемых в сборах')
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
                .setName('канал_для_ресета')
                .setDescription('Установить канал для отправки ресета')
                .addChannelOption(option => 
                    option
                        .setName('канал')
                        .setDescription('Непосредственно чат для ресета')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('обновляющих_ресет')
                .setDescription('Установить до двух людей, ответственных за ресеты')
                .addUserOption(option => 
                    option
                        .setName('пользователь1')
                        .setDescription('Первый пользователь'))
                .addUserOption(option => 
                    option
                        .setName('пользователь2')
                        .setDescription('Второй пользователь')))
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
                .setName('уведомления')
                .setDescription('Настройка сообщений, уведомляющих о прибытии и уходе'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'роли_для_сборов'){
            const role1 = interaction.options.getRole('роль1');
            const role2 = interaction.options.getRole('роль2');
            const role3 = interaction.options.getRole('роль3');
            const sett = interaction.client.settings.get(interaction.guild.id);
            sett.setRoleTags(role1, role2, role3);
            //если первая роль не введена, то роли сбрасываются
            if (!role1){
                await interaction.reply({content: 'Роли для тегов в сборах сброшены!'});
                interaction.client.rolesActTag = undefined;
                return;
            } 
            //записывает роли в отдельный словарь на клиенте
            interaction.client.rolesActTag = new Map();
            const rat = interaction.client.rolesActTag;
            rat.set(role1.id, role1);
            if (role2){
                rat.set(role2.id, role2);
            }
            if (role3){
                rat.set(role3.id, role3);
            }
            let str = '';
            rat.forEach((val) =>{
                str += `${val.name}\n`;
            });
            //оповещает о проделанной работе
            await interaction.reply({content: `Следующие роли для тегов в сборах были установлены:\n${str}`});
            return;
        }

        if (interaction.options.getSubcommand() === 'роли_для_новичков'){
            const role1 = interaction.options.getRole('роль1');
            const role2 = interaction.options.getRole('роль2');
            const role3 = interaction.options.getRole('роль3');
            const sett = interaction.client.settings.get(interaction.guild.id);
            sett.setRolesForNew(role1, role2, role3);
            //если первая роль не введена, то роли сбрасываются
            if (!role1){
                await interaction.reply({content: 'Роли для новичков сброшены!'});
                return;
            } 
            const rat = new Map();
            rat.set(role1.id, role1);
            if (role2){
                rat.set(role2.id, role2);
            }
            if (role3){
                rat.set(role3.id, role3);
            }
            let str = '';
            rat.forEach((val) =>{
                str += `${val.name}\n`;
            });

            //оповещает о проделанной работе
            await interaction.reply({content: `Следующие роли для новоприбывших были установлены:\n${str}`});
            return;
        }

        if (interaction.options.getSubcommand() === 'канал_для_ресета'){
            const channel = interaction.options.getChannel('канал');
            interaction.client.reset.setChannel(channel);
            const sett = interaction.client.settings.get(interaction.guild.id);
            sett.setResetChannel(channel);
            //если чат не введён, то он просто сбрасывается
            if (!channel){
                await interaction.reply({content: `Вы успешно сбросили канал для рассылки ресетов!`});
                return;
            }   
            await interaction.reply({content: `Вы успешно установили канал <#${channel.id}> как канал для рассылки ресетов!`});
            return;
        }

        if (interaction.options.getSubcommand() === 'обновляющих_ресет'){
            const user1 = interaction.options.getUser('пользователь1');
            const user2 = interaction.options.getUser('пользователь2');
            //установка пользователей на оповещение
            interaction.client.reset.setUpdaters(user1, user2);
            const sett = interaction.client.settings.get(interaction.guild.id);
            sett.setResetUpdaters(user1, user2);
            //если пользователи не введены, уведомления получать никто не будет
            if (!user1 && !user2){
                await interaction.reply({content: `Вы успешно сбросили оповещения о ресете!`});
                return;
            }
            if (user1 && user2){
                await interaction.reply({content: `Вы успешно определили пользователей ${user1.tag} и ${user2.tag} как ответственных за ресет!`});
                return;
            }
            if (user1){
                await interaction.reply({content: `Вы успешно определили пользователя ${user1.tag} как ответственного за ресет!`});
                return;
            }
            if (user2){
                await interaction.reply({content: `Вы успешно определили пользователя ${user2.tag} как ответственного за ресет!`});
                return;
            }
        }

        if (interaction.options.getSubcommand() === 'каналы_уведомлений'){
            const channelJ = interaction.options.getChannel('канал_прибывших');
            const channelL = interaction.options.getChannel('канал_ушедших');
            const sett = interaction.client.settings.get(interaction.guild.id);
            sett.setJLChannels(channelJ, channelL);
            //если чат не введён, то он просто сбрасывается
            if (!channelJ && !channelL){
                await interaction.reply({content: `Вы успешно сбросили каналы для уведомлений!`});
                return;
            }
            if (channelJ && channelL){
                await interaction.reply({content: `Вы успешно установили каналы <#${channelJ.id}> и <#${channelL.id}> как каналы для уведомлений!`});
                return;
            }
            if (channelJ){
                await interaction.reply({content: `Вы успешно установили канал <#${channelJ.id}> как канал для уведомлений о новоприбывших!`});
                return;
            }
            if (channelL){
                await interaction.reply({content: `Вы успешно установили канал <#${channelL.id}> как канал для уведомлений о новоприбывших!`});
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
                .setRequired(true);

            const messL = new TextInputBuilder()
                .setCustomId('messL')
                .setLabel('Уведомление при уходе (# - ник)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const row0 = new ActionRowBuilder().addComponents(messJ);
            const row1 = new ActionRowBuilder().addComponents(messL);

            modal.addComponents(row0, row1);
            //отправка формы пользователю
            await interaction.showModal(modal);
        }
    }
}