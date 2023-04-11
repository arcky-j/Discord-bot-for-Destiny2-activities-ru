const ActivityRes = require('./activityRes');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');

module.exports = class FireteamRes extends ActivityRes{
    constructor(id, mess, name, quant, leader, br1, br2){
        super(id, mess, name, quant, leader, br1, br2);
        this.members.set(leader.id, leader);
    }

    createEmbed(color, descript, banner, media){
        const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(this.name)
        .setDescription(descript)
        .addFields(
            {name: 'Время и дата', value: `...`, inline: true},
            {name: 'Статус', value: `Инициализация`, inline: true},
            {name: 'Лидер', value: `...`, inline: true},
            {name: 'Боевая группа', value: '...', inline: false},
            {name: 'Резерв', value: '...', inline: false}
        )
        .setThumbnail(banner)
        .setFooter({text: `ID: ${this.id}`});
        if (media){
            embed.setImage(media);
        }
        return embed;
    }

    createActionRow(){
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('go_fireteam')
                    .setLabel('Я точно иду!')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel_fireteam')
                    .setLabel('Я передумал')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('reserv_fireteam')
                    .setLabel('Резерв')
                    .setStyle(ButtonStyle.Secondary)               
            );
        return row;
    }

    remove(id){
        if (id == this.leaderId){ //проверка на лидерство
            throw new Error('Лидер не может покинуть боевую группу!');
        }
        super.remove(id);
    }

    changeLeader(user){
        if (user.id == this.leaderId){ //проверка на случай попытки сменить себя на себя
            throw new Error('Лидер пытается сменить себя на себя! чзх? я не буду это комментировать...');
        }

        if (user.bot){ //на всякий случай проверка, пытаются ли сделать лидером бота
            throw new Error('Возмутительно! Я не думал, что кому-то придёт назначать лидером бота, но и к этому я был готов');
        }

        if (this.members.has(user.id)){ 
            this.leaderId = user.id; //если новый лидер был в боевой группе, просто передаёт лидерство
        } else{
            //если нового лидера нет ни в боевой группе, ни в резерве              
            if (this.state == 'Заполнен'){                    
                this.members.delete(this.leaderId); //если группа была заполнена, удаляет предыдущего лидера
                this.members.set(user.id, user); //и только потом записывает нового лидера в боевую группу 
                this.leaderId = user.id;                
            } else {
                this.members.set(user.id, user); //если места есть, просто добавляет нового Стража и делает его лидером
                this.leaderId = user.id; 
            }
            this.checkQuantity();
        }   
        this.refreshMessage();
    }
}