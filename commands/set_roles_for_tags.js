const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
//команда для определения ролей, которые будут упомянуты в сборах
module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_roles_for_tags')
        .setDescription('Устанавливает роли для тегов в сборах (до трёх ролей).')
        .addRoleOption(option => 
            option.setName('роль1')
                .setDescription('Первая роль для тега'))
        .addRoleOption(option => 
            option.setName('роль2')
                .setDescription('Вторая роль для тега'))
        .addRoleOption(option => 
            option.setName('роль3')
                .setDescription('Третья роль для тега'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        const role1 = interaction.options.getRole('роль1');
        const role2 = interaction.options.getRole('роль2');
        const role3 = interaction.options.getRole('роль3');
        //если первая роль не введена, то роли сбрасываются
        if (!role1){
            await interaction.reply({content: 'Роли для тегов в сборах сброшены!', ephemeral:true});
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
        await interaction.reply({content: `Следующие роли для тегов в сборах были установлены:\n${str}`, ephemeral:true});

    }
}