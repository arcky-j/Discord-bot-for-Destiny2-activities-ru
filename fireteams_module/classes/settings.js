//класс для сохранения и менеджмента настроек бота на сервере
const {EmbedBuilder} = require('discord.js');
const Base = require('./base');

class Settings extends Base{
    rolesToTag = []; //роли для тэгов в сборах
    rolesForNew = []; //роли для присвоения новичкам на сервере
    channelJoin; //канал уведомлений о прибывших
    messageJoin; //уведомление о прибытии
    messageAccept; 
    channelLeave; //канал уведомлений о ливах 
    messageLeave; //уведомление о ливах
    logChannel;
    archiveChannel;
    statsOn;

    constructor(settManager){
        super();
        this.settManager = settManager;
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
        this.settManager.save();
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
        this.settManager.save();
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
        this.settManager.save();
    }

    setLogChannel(ch){
        this.logChannel = undefined;
        if (ch){
            this.logChannel = ch;
        }
        this.settManager.save();
    }

    setArchiveChannel(ch){
        this.archiveChannel = undefined;
        if (ch){
            this.archiveChannel = ch;
        }
        this.settManager.save();
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
        this.settManager.save();
    }

    async sendLog(message, title){
        if (this.logChannel){
            const embed = Settings.client.genEmbed(message, title);
            this.logChannel.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением лога на сервере ${this.settManager.clan}: ${err.message}\nСброс канала с логами...`);
                this.logChannel = undefined;
            });
        }
    }

    async sendArchive(actMessage, reason){
        if (this.archiveChannel && !reason){
            const embed = Settings.client.genEmbed('Архивация сбора...', 'Запись логов');
            this.archiveChannel.send({embeds: [embed, actMessage.embeds[0]]});
        }

        if (this.archiveChannel && reason){
            const embed = Settings.client.genEmbed(`Архивация сбора... причина: ${reason}`, 'Запись логов');
            this.archiveChannel.send({embeds: [embed, actMessage.embeds[0]]});
        }
    }

    async sendJoinAlert(member){
        if (!this.channelJoin) return;
        const color = member.roles.highest.color;
        if (this.messageJoin.match(/#/)){
            const embed = new EmbedBuilder().setTitle('Уведомление').setDescription(this.messageJoin.replace('#', `${member} (**${member.user.username}**)`)).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            }); //оповещает о прибытии
        } else {
            const embed = new EmbedBuilder().setTitle('Уведомление (стандартное - в тексте уведомления нет *#*)').setDescription(`${member} (**${member.user.username}**) прибыл на сервер!`).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            });
        }
    }

    async sendAcceptAlert(member){
        if (!this.channelJoin) return;
        const color = member.roles.highest.color;
        if (this.messageAccept.match(/#/)){
            const embed = new EmbedBuilder().setTitle('Уведомление').setDescription(this.messageAccept.replace('#', `${member} (**${member.user.username}**)`)).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            }); 
        } else {
            const embed = new EmbedBuilder().setTitle('Уведомление (стандартное - в тексте уведомления нет *#*)').setDescription(`${member} (**${member.user.username}**) принял правила сервера!`).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            });
        }
    }

    async sendLeaveAlert(member){
        if (!this.channelLeave) return;
        const color = member.roles.highest.color;
        if (this.messageLeave.match(/#/)){
            const embed = new EmbedBuilder().setTitle('Уведомление').setDescription(this.messageLeave.replace('#', `**${member.user.username}**`)).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelLeave.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления об уходе в ${this.channelLeave}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления об уходе в ${this.channelLeave}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelLeave = undefined;
            }); //оповещает об уходе
        } else {
            const embed = new EmbedBuilder().setTitle('Уведомление (стандартное - в тексте уведомления нет *#*)').setDescription(`**${member.user.username}** покинул сервер!`).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
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

        let strArch = '';
        if (this.archiveChannel){
            strArch = `${this.archiveChannel}`;
        }

        // let strStats = '';
        // if (this.statsOn){
        //     strArch = `Включён`;
        // } else {
        //     strArch = `Выключен`;
        // }

        const str = `Роли, упоминаемые в сборах: ${strT}\nРоли для новоприбывших: ${strN}\nКанал для уведомлений о прибытии: ${strCHJ}\nУведомление о прибытии: ${this.messageJoin}\nУведомление о принятии правил: ${this.messageAccept}\nКанал для уведомлений об уходе: ${strCHL}\nУведомление об уходе: ${this.messageLeave}\nКанал с логами: ${strLog}\nКанал для архивации: ${strArch}`;
        return str;
    }
}

module.exports = Settings;