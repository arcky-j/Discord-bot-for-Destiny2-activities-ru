//класс, содержащий в себе всё для работы со сборами
class FireTeam{
    id;
    message;
    name; //название активности
    actType; //тип активности
    quantity; //необходимое количество Стражей
    members = new Map(); //словарь для хранения боевой группы
    reservs = new Map(); //словарь для хранения резерва
    date = new Date(); //дата начала активности
    bron = new Map(); //словарь для забронированных Стражей
    bronSize; //максимальный размер брони
    bronCounter; //сколько было забронировано

    constructor(id, mess, leader, name, nDate, typ, quan, rowdm, br1, br2){
        this.id = id;
        this.message = mess;
        this.name = name;
        this.members.set(leader.id, leader);
        this.leaderId = leader.id;
        this.date = nDate;
        this.actType = typ;
        this.rowdm = rowdm;
        this.bronCounter = 0;
        switch (typ){
            case 'raid': this.quantity = 6;
                        this.bronSize = 2;
                break;
            case 'dungeon': this.quantity = 3;
                        this.bronSize = 1;
                break;
            default: if (quan !== undefined) this.quantity = quan;
                    else this.quantity = 6;
                    this.bronSize = Math.ceil(this.quantity/2 - 1);
                break;
        }
        if (br1){
            this.bron.set(br1.id, br1);
            br1.send({content: `Вы были записаны лидером активности в ${name}. Ссылка на сбор: ${this.message.url}\nПодтверждаете свою готовность? ID: ${this.id}`, components:[rowdm]});
            this.bronCounter++;
        }
        if (br2){
            this.bron.set(br2.id, br2);
            br2.send({content: `Вы были записаны лидером активности в ${name}. Ссылка на сбор: ${this.message.url}\nПодтверждаете свою готовность? ID: ${this.id}`, components:[rowdm]});
            this.bronCounter++;
        }
    }
    //добавление Стража в боевую группу
    memberAdd(id, user){
        if (this.members.has(id)){ //проверка на присутствие в боевой группе
            throw new Error('Ты уже записан в боевую группу!'); 
        } 
        if (this.bron.has(id)){ //проверка на присутствие в списке брони
            throw new Error('Пользователю уже забронировано место! Если вы тот самый пользователь, подтвердите бронь в ЛС'); 
        }
        if (this.members.size == this.quantity){ //проверка на количество стражей
            throw new Error('Сбор уже укомплектован!');
        }
        if (this.members.size + this.bron.size == this.quantity){ //проверка на количество стражей с учётом брони
            throw new Error('Сбор уже укомплектован!');
        }
        if (user.bot){ //проверка на случай, если кто-то насильно догадается записать в сбор бота
            throw new Error('Возмутительно! Я не думал, что кому-то придёт в голову совать в сбор бота, но и к этому я был готов');
        }
        this.members.set(id, user); //добавление в боевую группу

        if (this.reservs.has(id)){ //удаление из резервов, если Страж там был
            this.reservs.delete(id);
        }
    }
    //удаление Стража из боевой группы
    memberDel(id){
        if (!this.members.has(id)){ //проверка на отсутствие в боевой группе
            throw new Error('Пользователь не был записан в эту боевую группу! Не в моих силах его из неё убрать'); 
        } 

        if (id == this.leaderId){ //проверка на лидерство
            throw new Error('Лидер не может покинуть боевую группу!');
        }

        this.members.delete(id); //удаление из боевой группы
    }
    //добавление Стража в резерв
    reservAdd(id, user){
        if (this.reservs.has(id)){ //проверка на запись в резерв
            throw new Error('Этот пользователь уже записан в резерв!'); 
        } 

        if (id == this.leaderId){ //проверка на лидерство
            throw new Error('Лидер не может записаться в резерв!'); 
        } 
        
        this.reservs.set(id, user); //запись в резерв

        if (this.members.has(id)){ //удаление из боевой группы, если нужно
            this.members.delete(id);
        }
    }
    //удаление Стража из резерва
    reservDel(id){
        if (!this.reservs.has(id)){ //проверка на отсутствие в резерве
            throw new Error('Ты в резерве не был! Увы, я не смогу тебя оттуда удалить'); 
        } 
        this.reservs.delete(id); //удаление из резерва
    }
    //бронирование места Сражу
    bronAdd(id, user){
        if (this.members.has(id)){ //проверка на присутствие в боевой группе
            throw new Error('Пользователь уже записан в боевую группу!'); 
        } 
        if (this.bron.has(id)){ //проверка на присутствие в списке брони
            throw new Error('Пользователю уже забронировано место!'); 
        } 
        if (this.bronCounter == this.bronSize){ //проверка на максимальное количество брони
            throw new Error('Вы уже забронировали максимум! Для этой активности это ' + this.bronSize + ' места'); 
        } 
        if (this.bron.size == this.bronSize){ //проверка на заполненность брони
            throw new Error('Вы уже забронировали максимум! Для этой активности это ' + this.bronSize + ' места'); 
        } 
        if (this.members.size + this.bron.size == this.quantity){ //проверка на количество стражей с учётом брони
            throw new Error('Сбор уже укомплектован!');
        }
        if (this.members.size == this.quantity){ //проверка на количество стражей
            throw new Error('Сбор уже укомплектован!');
        }
        if (user.bot){ //проверка на случай, если кто-то насильно догадается записать в сбор бота
            throw new Error('Возмутительно! Я не думал, что кому-то придёт в голову совать в сбор бота, но и к этому я был готов');
        }
        this.bron.set(id, user);
        user.send({content: `Вы были записаны лидером активности в ${this.name}. Ссылка на сбор: ${this.message.url}\nПодтверждаете свою готовность? ID: ${this.id}`, components:[this.rowdm]});
        this.bronCounter++;
        const embed = this.message.embeds[0];
        embed.fields[2].value = this.getMembersString();
        embed.fields[3].value = this.getReservsString();
        this.message.edit({embeds: [embed]});
    }
    //удаление из брони
    bronDel(id){
        if (!this.bron.has(id)){ //проверка на присутствие в боевой группе
            throw new Error('Пользователю не было забронировано место!'); 
        }
        const us = this.bron.get(id);
        this.bron.delete(id);
        const embed = this.message.embeds[0];
        embed.fields[2].value = this.getMembersString();
        embed.fields[3].value = this.getReservsString();
        this.message.edit({embeds: [embed]});
        this.bronCounter--;
    }
    //перевод из брони в боевую группу
    bronToMember(id, user){
        if (!this.bron.has(id)){ //проверка на присутствие в боевой группе
            throw new Error('Пользователю не было забронировано место!'); 
        }
        this.bron.delete(id);
        this.members.set(id, user);
        const embed = this.message.embeds[0];
        embed.fields[2].value = this.getMembersString();
        embed.fields[3].value = this.getReservsString();
        this.message.edit({embeds: [embed]});
    }
    //смена лидера со всеми проверками
    changeLeader(id,newId, nUser){
        if (id != this.leaderId){ //первостепенная проверка на лидерство
            throw new Error('Только лидер может назначить другого лидера!');
        }

        if (newId == id){ //проверка на случай попытки сменить себя на себя
            throw new Error('Лидер пытается сменить себя на себя! чзх? я не буду это комментировать...');
        }

        if (nUser.bot){ //на всякий случай проверка, пытаются ли сделать лидером бота
            throw new Error('Возмутительно! Я не думал, что кому-то придёт назначать лидером бота, но и к этому я был готов');
        }

        if (this.members.has(newId)){ 
            this.leaderId = newId; //если новый лидер был в боевой группе, просто передаёт лидерство
        } else if(this.reservs.has(newId)) {
            this.reservs.delete(newId); //если новый лидер был в резерве, то сперва удаляет его из резервов
            if (this.members.size == this.quantity || this.members.size + this.bron.size == this.quantity){
                this.memberDel(id); //если группа была заполнена, удаляет предыдущего лидера
            }       
            this.members.set(newId, nUser); //и только потом записывает нового лидера в боевую группу                 
            this.leaderId = newId;
        } else{
            this.leaderId = '';  //если нового лидера нет ни в боевой группе, ни в резерве              
            if (this.members.size == this.quantity || this.members.size + this.bron.size == this.quantity){                    
                this.memberDel(id); //если группа была заполнена, удаляет предыдущего лидера
                this.members.set(newId, nUser); //и только потом записывает нового лидера в боевую группу 
                this.leaderId = newId;                
            } else {
                this.members.set(newId, nUser); //если места есть, просто добавляет нового Стража и делает его лидером
                this.leaderId = newId; 
            }
        }
        const embed = this.message.embeds[0];
        embed.fields[1].value = `<@${newId}>`;
        embed.fields[2].value = this.getMembersString();
        embed.fields[3].value = this.getReservsString();
        return embed;
    }
    //смена даты
    changeDate(id,newDate){
        if (id == this.leaderId){ //проверка на лидерство
            this.date = newDate; //установка даты
        } else {
            throw new Error('Только лидер может сменить дату/время сбора!');
        }
        const embed = this.message.embeds[0];
        embed.fields[0].value = this.getDateString();
        return embed;        
    }
    //рассылка оповещений в личные сообщения
    sendAlerts(reason){
        switch(reason){
            case 'del': //рассылка при удалении активности
                this.members.forEach( async (us, id) =>{
                    if (this.leaderId != id) //рассылает оповещение всем участникам кроме лидера
                    us.send({content: `Активность ${this.name} на ${this.getDateString()}, в которую вы были записаны, была отменёна пользователем ${this.getLeader().tag}.`, embeds:this.message.embeds});
                });
                break;
            case 'uptime': //рассылка при скором начале активности
                this.members.forEach( async (us, id) =>{ //оповещает всех участников
                    us.send({content: `${this.name} начнётся в ближайшие **10 минут**!\n`, embeds: this.message.embeds});
                });
                if (this.reservs.size > 0 && this.members.size < this.quantity)
                this.reservs.forEach( async (us, id) =>{ //если есть резервы и боевой группы не хватает, оповещает резервистов
                    us.send({content:`${this.name} начнётся в ближайшие **10 минут**! Вы были записаны в резерв и получаете это сообщение, потому что боевая группа меньше необходимого!`, embeds: this.message.embeds});
                });
                if (this.bron.size > 0 && this.members.size < this.quantity)
                this.bron.forEach( async (us, id) =>{ //если есть резервы и боевой группы не хватает, оповещает резервистов
                    us.send({content:`${this.name} начнётся в ближайшие **10 минут**! Вам было забронировано место, поэтому вы получаете это сообщение!`, embeds: this.message.embeds});
                });
                break;
            case 'dateChange': //рассылка при переносе активности
                this.members.forEach( async (us, id) =>{
                    if (this.leaderId != id) //рассылает оповещение всем участникам кроме лидера
                    us.send({content: `Активность ${this.name}, в которую вы записаны, перенесёна пользователем ${this.getLeader().tag}! Новое время: ${this.getDateString()}`, embeds: this.message.embeds});
                });
                break;
            case 'admin_del': //рассылка при удалении активности администратором
                this.members.forEach( async (us, id) =>{
                    us.send({content: `Активность ${this.name} на ${this.getDateString()}, в которую вы были записаны, была отменёна администратором. Более подробная информация в канале сбора.`, embeds: this.message.embeds});
                });
                break;
        }
    }
    //вспомогательный метод для создания строки с датой-временем
    getDateString(){
        //получает отдельные части даты
        const h = this.date.getHours();
        const m = this.date.getMinutes();

        const day = this.date.getDate();
        const mon = this.date.getMonth() + 1;
        const year = this.date.getFullYear();
        //если число однозначное, добавляет 0 в начале
        let hT = h, mT = m, dayT = day, monT = mon;
        if (h<10) hT = `0${h}`;
        if (m<10) mT = `0${m}`;
        if (day<10) dayT = `0${day}`;
        if (mon<10) monT = `0${mon}`;

        return `**${hT}:${mT}** МСК **${dayT}.${monT}.${year}**`; //возвращает строку со временем в предпочитаемом формате
    }
    //вспомогательный метод для создания строки с участниками боевой группы
    getMembersString(){
        let str = '';
        this.members.forEach(function(value1, value2, mp){
            str += `<@${value1.id}>\n`;
        });
        this.bron.forEach(function(value1, value2, mp){
            str += `#бронь\n`;
        });
        return str; //возвращает строку со всеми участниками боевой группы в столбик
    }
    //вспомогательный метод для создания строки с резервистами
    getReservsString(){
        let str = '';
        if (this.reservs.size == 0){
            return 'Резерв пуст';
        }
        this.reservs.forEach(function(value1, value2){
            str += `<@${value1.id}>\n`;
        });
        return str; //возвращает строку со всеми резервистами в столбик
    }
    //вспомогательный метод для обновления списков
    refreshLists(){
        const embed = this.message.embeds[0];
        embed.fields[2].value = this.getMembersString();
        embed.fields[3].value = this.getReservsString();
        return embed;
    }
    //вспомогательный метод для нахождения лидера боевой группы
    getLeader(){
        const lead = this.members.get(this.leaderId);
        return lead;
    }
    //вспомогательный метод для нахождения id (иногда его достаточно) лидера боевой группы
    getLeaderId(){
        return this.leaderId;
    }
    //вспомогательный метод для проверки пользователя на лидерство
    isLeader(id){
        if (id == this.leaderId){
            return true;
        } else {
            return false;
        }
    }
    //вспомогательный метод для проверки пользователя на присутствие в боевой группе
    hasMember(id){
        return this.members.has(id);
    }
}

module.exports = FireTeam;