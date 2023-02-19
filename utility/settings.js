//класс для сохранения и менеджмента настроек бота на сервере
class Settings{
    guildId; 
    rolesToTag = []; //роли для тэгов в сборах
    resetChannel; //канал для ресетов
    resetUpdaters = []; //обновляющие ресет
    rolesForNew = []; //роли для присвоения новичкам на сервере
    channelJoin; //канал уведомлений о прибывших
    messageJoin; //уведомление о прибытии
    channelLeave; //канал уведомлений о ливах 
    messageLeave; //уведомление о ливах

    constructor(id){
        this.guildId = id;
        this.messageJoin = '# прибыл на сервер!';
        this.messageLeave = '# покинул нас';
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
    }

    setResetChannel(channel){
        this.resetChannel = undefined;
        if (channel)
        this.resetChannel = channel;
    }

    setResetUpdaters(us0, us1){
        this.resetUpdaters = [];
        if (us0){
            this.resetUpdaters.push(us0);
        }
        if (us1){
            this.resetUpdaters.push(us1);
        }
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
    }

    setJLMessages(messJ, messL){
        this.messageJoin = undefined;
        this.messageLeave = undefined;
        if (messJ){
            this.messageJoin = messJ;
        }
        if (messL){
            this.messageLeave = messL;
        }
    }

    getString(){
        let strT = '';
        this.rolesToTag.forEach((val) => {
            strT += `<@&${val.id}> `;
        });

        let strU = '';
        this.resetUpdaters.forEach((val) =>{
            strU += `<@${val.id}> `;
        });

        let strN = '';
        this.rolesForNew.forEach((val) =>{
            strN += `<@&${val}> `;
        });

        let strRCh = '';
        if (this.resetChannel){
            strRCh = `<#${this.resetChannel.id}>`;
        }

        let strCHJ = '';
        if (this.channelJoin){
            strCHJ = `<#${this.channelJoin.id}>`;
        }

        let strMJ = '';
        if (this.messageJoin){
            strMJ = this.messageJoin;
        }

        let strCHL = '';
        if (this.channelLeave){
            strCHL = `<#${this.channelLeave.id}>`;
        }

        let strML = '';
        if (this.messageLeave){
            strML = this.messageLeave;
        }

        const str = `Роли, упоминаемые в сборах: ${strT}\nКанал для ресетов: ${strRCh}\nОбновляющие ресет: ${strU}\nРоли для новоприбывших: ${strN}\nКанал для уведомлений о прибытии: ${strCHJ}\nУведомление о прибытии: ${strMJ}\nКанал для уведомлений об уходе: ${strCHL}\nУведомление об уходе: ${strML}`;
        return str;
    }
}

module.exports = Settings;