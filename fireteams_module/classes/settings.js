//класс для сохранения и менеджмента настроек бота на сервере
const {EmbedBuilder} = require('discord.js');
const Base = require('./base');

class Settings extends Base{
    guildId; 
    rolesToTag = []; //роли для тэгов в сборах
    rolesForNew = []; //роли для присвоения новичкам на сервере
    channelJoin; //канал уведомлений о прибывших
    messageJoin; //уведомление о прибытии
    messageAccept; 
    channelLeave; //канал уведомлений о ливах 
    messageLeave; //уведомление о ливах
    logChannel;

    constructor(id){
        super();
        this.guildId = id;
        this.messageJoin = '# прибыл на сервер!';
        this.messageAccept = '# принял правила сервера!';
        this.messageLeave = '# покинул сервер';        
    }

    setRoleTags(r0, r1, r2, r3, r4){
        this.rolesToTag = [];
        if (r0){
            this.rolesToTag.push(r0);
            }  
        if (r1){
            this.rolesToTag.push(r1);
        }
        if (r2){
            this.rolesToTag.push(r2);
        }
        if (r3){
            this.rolesToTag.push(r3);
        }
        if (r4){
            this.rolesToTag.push(r4);
        }
        const clan = this.client.d2clans.get(this.guildId);
        clan.settings.save();
    }

    setRolesForNew(r0, r1, r2){
        this.rolesForNew = [];
        if (r0){
            this.rolesForNew.push(r0.id);
        }
        if (r1){
            this.rolesForNew.push(r1.id);
        }
        if (r2){
            this.rolesForNew.push(r2.id);
        }
        const clan = this.client.d2clans.get(this.guildId);
        clan.settings.save();
    }

    setJLChannels(chJ, chL){
        this.channelJoin = undefined;
        this.channelLeave = undefined;
        if (chJ){
            this.channelJoin = chJ;
        }
        if (chL){
            this.channelLeave = chL;
        }
        const clan = this.client.d2clans.get(this.guildId);
        clan.settings.save();
    }

    setLogChannel(ch){
        this.logChannel = undefined;
        if (ch){
            this.logChannel = ch;
        }
        const clan = this.client.d2clans.get(this.guildId);
        clan.settings.save();
    }

    setJALMessages(messJ, messA, messL){
        if (messJ){
            this.messageJoin = messJ;
        }
        if (messA){
            this.messageAccept = messA;
        }
        if (messL){
            this.messageLeave = messL;
        }
        const clan = this.client.d2clans.get(this.guildId);
        clan.settings.save();
    }

    async sendLog(message, title){
        if (this.logChannel){
            const embed = Settings.client.genEmbed(message, title);
            this.logChannel.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением лога на сервере ${this.guildId}: ${err.message}\nСброс канала с логами...`);
                this.logChannel = undefined;
            });
        }
    }

    async sendJoinAlert(member){
        const color = member.roles.highest.color;
        if (this.messageJoin.match(/#/)){
            const embed = new EmbedBuilder().setTitle('Уведомление').setDescription(this.messageJoin.replace('#', `<@${member.user.id}> (**${member.user.tag}**)`)).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            }); //оповещает о прибытии
        } else {
            const embed = new EmbedBuilder().setTitle('Уведомление (стандартное - в тексте уведомления нет *#*)').setDescription(`<@${member.user.id}> (**${member.user.tag}**) прибыл на сервер!`).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            });
        }
    }

    async sendAcceptAlert(member){
        const color = member.roles.highest.color;
        if (this.messageAccept.match(/#/)){
            const embed = new EmbedBuilder().setTitle('Уведомление').setDescription(this.messageAccept.replace('#', `<@${member.user.id}> (**${member.user.tag}**)`)).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            }); 
        } else {
            const embed = new EmbedBuilder().setTitle('Уведомление (стандартное - в тексте уведомления нет *#*)').setDescription(`<@${member.user.id}> (**${member.user.tag}**) принял правила сервера!`).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            });
        }
    }

    async sendLeaveAlert(member){
        const color = member.roles.highest.color;
        if (this.messageLeave.match(/#/)){
            const embed = new EmbedBuilder().setTitle('Уведомление').setDescription(this.messageLeave.replace('#', `**${member.user.tag}**`)).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelLeave.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления об уходе в ${this.channelLeave}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления об уходе в ${this.channelLeave}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelLeave = undefined;
            }); //оповещает об уходе
        } else {
            const embed = new EmbedBuilder().setTitle('Уведомление (стандартное - в тексте уведомления нет *#*)').setDescription(`**${member.user.tag}** покинул сервер!`).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelLeave.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления об уходе в ${this.channelLeave}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления об уходе в ${this.channelLeave}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelLeave = undefined;
            });
        }
    }

    getString(){
        let strT = '';
        this.rolesToTag.forEach((val) => {
            strT += `${val} `;
        });

        let strN = '';
        this.rolesForNew.forEach((val) =>{
            strN += `<@&${val}> `;
        });

        let strCHJ = '';
        if (this.channelJoin){
            strCHJ = `${this.channelJoin}`;
        }

        let strCHL = '';
        if (this.channelLeave){
            strCHL = `${this.channelLeave}`;
        }

        let strLog = '';
        if (this.logChannel){
            strLog = `${this.logChannel}`;
        }

        const str = `Роли, упоминаемые в сборах: ${strT}\nРоли для новоприбывших: ${strN}\nКанал для уведомлений о прибытии: ${strCHJ}\nУведомление о прибытии: ${this.messageJoin}\nУведомление о принятии правил: ${this.messageAccept}\nКанал для уведомлений об уходе: ${strCHL}\nУведомление об уходе: ${this.messageLeave}\nКанал с логами: ${strLog}`;
        return str;
    }
}

module.exports = Settings;