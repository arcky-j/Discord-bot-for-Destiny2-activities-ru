const {StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, ChannelType} = require('discord.js');

module.exports = {
    name: 'gen_raid',
    async execute(interaction){    
        const id = interaction.client.generateId(interaction.client.activities);
        const thread = await interaction.channel.threads.create({
            name: `Сбор ${id}`,
            autoArchiveDuration: 60,
            type: ChannelType.PrivateThread
        });
        thread.members.add(interaction.user.id);
        const raidSelect = new StringSelectMenuBuilder()
        .setCustomId('raid_name_choice')
        .setPlaceholder('Выберите название рейда!')
        .setOptions(
            new StringSelectMenuOptionBuilder()
            .setLabel('Источник Кошмаров')
            .setDescription('Вы хотите собрать группу в Источник Кошмаров')
            .setValue(`Источник Кошмаров_${id}`),
            new StringSelectMenuOptionBuilder()
            .setLabel('Гибель Короля')
            .setDescription('Вы хотите собрать группу в Гибель Короля')
            .setValue(`Гибель Короля_${id}`),
            new StringSelectMenuOptionBuilder()
            .setLabel('Клятва Послушника')
            .setDescription('Вы хотите собрать группу в Клятва Послушника')
            .setValue(`Клятва Послушника_${id}`),
            new StringSelectMenuOptionBuilder()
            .setLabel('Хрустальный Чертог')
            .setDescription('Вы хотите собрать группу в Хрустальный Чертог')
            .setValue(`Хрустальный Чертог_${id}`),
            new StringSelectMenuOptionBuilder()
            .setLabel('Склеп Глубокого Камня')
            .setDescription('Вы хотите собрать группу в Склеп Глубокого Камня')
            .setValue(`Склеп Глубокого Камня_${id}`),
            new StringSelectMenuOptionBuilder()
            .setLabel('Сад Спасения')
            .setDescription('Вы хотите собрать группу в Сад Спасения')
            .setValue(`Сад Спасения_${id}`),
            new StringSelectMenuOptionBuilder()
            .setLabel('Последнее Желание')
            .setDescription('Вы хотите собрать группу в Последнее Желание')
            .setValue(`Последнее Желание_${id}`),
        )
        const row = new ActionRowBuilder().setComponents(raidSelect);
        const embedGen = interaction.client.genEmbed(`Выберите рейд`, 'Уведомление');
        thread.send({embeds: [embedGen], components: [row]});
        const embed = interaction.client.genEmbed(`Перейдите в приватную ветку для продолжения\n${thread.url}`, 'Уведомление');
        interaction.reply({embeds: [embed], ephemeral:true});
    }
}