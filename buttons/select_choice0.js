module.exports = {
    name: 'select_choice0',
    async execute(interaction){
        const embed = interaction.message.embeds[0];
        const user = interaction.user;
        //поиск нужного голосования
        const poll = interaction.client.polls.get(interaction.message.id);
        if (!poll){
            await interaction.reply({content: `Скорее всего, голосование было закрыто. Возможно, произошла непредвиденная ошибка`, ephemeral: true});
            return;
        }
        //попытка засчитать голос за первый вариант
        try {
            poll.addVoter(user, 0);
        } catch (err) {
            await interaction.reply({content: err.message, ephemeral: true});
            return;
        }        
        //обновление сообщения голосования
        embed.fields[0].value = poll.getVotersString0();
        if (poll.isChangeble){
            embed.fields[1].value = poll.getVotersString1();
            if (embed.fields[2]){
                embed.fields[2].value = poll.getVotersString2();
            }
            if (embed.fields[3]){
                embed.fields[3].value = poll.getVotersString3();
            }
            if (embed.fields[4]){
                embed.fields[4].value = poll.getVotersString4();
            }
        }
        await interaction.update({embeds: [embed]});
    }
}