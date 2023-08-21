const Base = require("./base");
const ActivityEvents = require('../consts/activityEvents');
const {Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');

module.exports = class Activity extends Base{
    id;
    message;
    name;
    quantity;
    leader;
    guildId;
    members = new Collection();
    state;
    delTimer;
    #day = 86400000;

    #states = {
        0: 'Закрыт',
        1: 'Открыт',
        2: 'Заполнен',
        3: 'Отменен',
        4: 'Начат',
        5: 'Отменен администратором'
    }

    #alerts = {       
        Delete: 0,
        AdminDelete: 1,
        Uptime: 2,
        Start: 3,
        DateChange: 4,
    }

    constructor({id, clan, name, date, quant, leader, bron1, bron2, state, message}){
        super();
        this.id = id;
        this.name = name;
        this.quantity = quant;
        this.leader = leader;
        this.clan = clan;
        this.guildId = clan.id;
        this.date = date;

        if (date instanceof Date){
            this.#setTimer();
            this.reservs = new Collection();
            this.bronList = new Collection();
            this.bronLimit = Math.ceil(quant/2 - 1);
            if (bron1){
                setTimeout(() =>{
                    this.bronAdd(bron1);        
                }, 5000);
            }
            if (bron2){
                setTimeout(() =>{
                    this.bronAdd(bron2);        
                }, 5000);                       
            } 
        } else {
            this.delTimer = setTimeout(() =>{
                this.close();
            }, this.#day);
        }
        this.members.set(leader.id, leader);

        if (message){
            this.message = message;
        }

        if (!state){
            this.state = this.#states[1];
        } else {
            if (state == this.#states[0] || state == this.#states[4]) setTimeout(() => {this.close()}, 5000);
            if (state == this.#states[2]) this.state = state;
            if (state == this.#states[3] || state == this.#states[5]) setTimeout(() => {this.delete()}, 5000);
        }
    }

    setState(state){
        this.state = this.#states[state];
    }

    add(member){
        if (this.state == this.#states[0] || this.state == this.#states[3] || this.state == this.#states[5]){
            throw this.#genError('Этот сбор уже не работает!');
        }
        if (this.bronList && this.bronList.has(member.id)){ //проверка на присутствие в списке брони
            this.bronToMember(member);
            return;
        }

        if (this.members.has(member.id)){ //проверка на присутствие в боевой группе
            throw this.#genError(`${member} уже записан в сбор!`);
        } 
        if (this.state == this.#states[2]){ //проверка на количество стражей
            throw this.#genError(`${member}, сбор уже укомплектован!`);
        }
        if (member.user.bot){ //проверка на случай, если кто-то насильно догадается записать в сбор бота
            throw this.#genError(`Возмутительно! Я не думал, что кому-то придёт в голову совать в сбор бота! Ладно, думал...`);          
        }

        this.members.set(member.id, member);

        if (this.reservs && this.reservs.has(member.id)){
            this.moveReserv(member);
        }

        this.refreshMessage({members:true, reservs:true});
        this.client.emit(ActivityEvents.MemberAdd, this, member);
    }

    remove(member){
        if (this.state == this.#states[0] || this.state == this.#states[3] || this.state == this.#states[5]){
            throw this.#genError('Этот сбор уже не работает!');
        }
        if (member.id == this.leader.id){
            throw this.#genError(`${member}, как лидер, не может покинуть боевую группу!\nно может передать лидерство и уйти...`);          
        }

        if (this.bronList && this.bronList.has(member.id)){ //проверка на присутствие в списке брони
            this.bronDel(member.id);
            return;
        }

        if (!this.members.has(member.id)){ //проверка на отсутствие в боевой группе
            throw this.#genError(`${member} не записан в эту боевую группу! Не в моих силах его из неё убрать`);          
        } 

        this.members.delete(member.id); //удаление из боевой группы
        this.refreshMessage({members:true, reservs:true});
        this.client.emit(ActivityEvents.MemberRemove, this, member);
    }

    changeLeader(member){
        if (this.state == this.#states[0] || this.state == this.#states[3] || this.state == this.#states[5]){
            throw this.#genError('В этом сборе уже нельзя изменить лидера!');
        }
        if (member.id == this.leader.id){ //проверка на случай попытки сменить себя на себя
            throw this.#genError(`${member} пытается передать лидерство самому себе! чзх? я не буду это комментировать...`);          
        }

        if (member.user.bot){ //на всякий случай проверка, пытаются ли сделать лидером бота      
            throw this.#genError(`Возмутительно! Я не думал, что кому-то придёт назначать лидером бота! Ладно, думал...`);          
        }
        const oldLead = this.members.get(this.leader.id);

        if (this.bronList && this.bronList.has(member.id)){
            this.bronToMember(member);
        }

        if (this.members.has(member.id)){ 
            this.leader = member; //если новый лидер был в боевой группе, просто передаёт лидерство
        } else if (this.state == this.#states[2]){                    
            this.members.delete(this.leader.id); //если группа была заполнена, удаляет предыдущего лидера
            this.members.set(member.id, member); //и только потом записывает нового лидера в боевую группу 
            this.leader = member;                
        } else {
            this.members.set(member.id, member); //если места есть, просто добавляет нового Стража и делает его лидером
            this.leader = member; 
        } 

        if (this.reservs && this.reservs.has(member.id)){
            this.reservs.delete(member.id);
        }              

        this.#sendMessage({member: member, message: `Вам было передано управление сбором ${this}!\nСсылка на сбор: ${this.message.url}`, header: 'Уведомление'});
        this.client.emit(ActivityEvents.ChangedLeader, this, member, oldLead);
        this.refreshMessage({members:true, reservs:true, leader:true});
    }

    moveReserv(member){
        if (this.reservs.has(member.id)){ //проверка на запись в резерв
            this.reservs.delete(member.id);
            this.client.emit(ActivityEvents.ReservRemove, this, member);
        } else {
            if (member.id == this.leader.id){ //проверка на лидерство
                throw this.#genError(`${member}, как лидер, не может записаться в резерв!`);          
            }
            
            this.reservs.set(member.id, member); //запись в резерв
            this.client.emit(ActivityEvents.ReservAdd, this, member);

            if (this.members.has(member.id)){ //удаление из боевой группы, если нужно
                this.members.delete(member.id);
            }
        }
        this.refreshMessage({members:true, reservs:true});
    }

    bronAdd(member){
        if (this.state == this.#states[0] || this.state == this.#states[3] || this.state == this.#states[5]){
            throw this.#genError('Этот сбор уже не работает с бронью!');
        }
        if (!this.bronList){
            throw this.#genError(`Этот сбор не рассчитан на бронь!`);  
        }
        if (this.members.has(member.id)){ //проверка на присутствие в боевой группе 
            throw this.#genError(`${member} уже записан в боевую группу!`);           
        } 
        if (member.id == this.leader.id){ //проверка на присутствие в боевой группе
            throw this.#genError(`${member}, как лидер, не может забронировать себе место.\nчто это вообще за чушь?`);
        } 
        if (this.bronList.has(member.id)){ //проверка на присутствие в списке брони
            throw this.#genError(`${member} уже имеет бронь!`);
        } 
        if (this.bronList.size == this.bronLimit){ //проверка на заполненность брони
            throw this.#genError(`Вы уже забронировали максимум! Лимит для этой активности: **${this.bronLimit}**`); 
        } 
        if (this.state == this.#states[2]){ //проверка на количество стражей с учётом брони
            throw this.#genError(`Сбор уже укомплектован! Бронь невозможна!`);
        }
        if (member.user.bot){ //проверка на случай, если кто-то насильно догадается записать в сбор бота
            throw this.#genError(`Возмутительно! Я не думал, что кому-то придёт в голову бронировать место боту! Ладно, думал...`);
        }   
        this.#sendMessage({member: member, message: `Вам было забронировано место в ${this}.\nСсылка на сбор: ${this.message.url}`, header: 'Уведомление'})
        .then(m => {
            this.bronList.set(member.id, member);
            this.refreshMessage({members:true});
        })
        .catch(async err =>{
            this.clan.config.sendLog(`Ошибка бронирования пользователя ${member.user.tag}:\n${err.message}`, 'Запись логов: ошибка');
            console.log(`Ошибка бронирования пользователя ${member.user.tag}: ${err.message}`);
        });
        
    }

    //удаление из брони
    bronDel(member){
        if (this.state == this.#states[0] || this.state == this.#states[3] || this.state == this.#states[5]){
            throw this.#genError('Этот сбор уже не работает с бронью!');
        }
        if (!this.bronList){
            throw this.#genError(`Этот сбор не рассчитан на бронь!`);  
        }
        if (!this.bronList.has(member.id)){ //проверка на присутствие в боевой группе
            throw this.#genError(`${member} не имел брони!`);
        }
        this.bronList.delete(member.id);
        //this.checkQuantity();
        this.refreshMessage({members:true});       
    }

    //перевод из брони в боевую группу
    bronToMember(member){
        if (!this.bronList.has(member.id)){ //проверка на присутствие в боевой группе
            throw this.#genError(`${member} не имел брони!`);
        }
        this.bronList.delete(member.id);
        this.members.set(member.id, member);
        this.client.emit(ActivityEvents.MemberAdd, this, member);
        this.refreshMessage({members:true}); 
    }

    checkQuantity(){
        if (this.state == this.#states[0]){
            return;
        }

        if (this.bronList){
            if (this.members.size + this.bronList.size == this.quantity){
                this.state = this.#states[2];           
            } else {
                this.state = this.#states[1];
            }
        } else {
            if (this.members.size == this.quantity){
                if (this.state != this.#states[4])
                setTimeout(() => {
                    this.start();
                }, 10000)
            } else {
                this.state = this.#states[1];
            }
        }
    }

    #setTimer(){
        const today = new Date();
        const tenMinutes = 600000;
        if (today > this.date){
            this.close();
            return;
        }        
        const t = this.date - today - tenMinutes; 
        if (this.t > 2147483647){
            this.interval = setInterval(async () => {
                if (this.t < 2147483647){
                    clearInterval(this.interval);
                    this.#setTimer();
                }
            }, this.#day * 20);
            return;
        } 
        this.timer = setTimeout(() => {
            if (this.date - today > tenMinutes)
            this.sendAlerts(this.#alerts.Uptime);
            setTimeout(async () => {
                try{
                    this.close();
                } catch (err){
                    console.log('Ошибка таймера: ' + err.message)
                }
            }, tenMinutes*2);
        }, t);          
    }

    changeDate(newDate){
        if (!(this.date instanceof Date)){
            return;
        }

        if (this.state == this.#states[0] || this.state == this.#states[3] || this.state == this.#states[5]){
            throw this.#genError('Этот сбор уже не может быть перенесён!');
        }

        this.date = newDate; //установка даты    
        clearTimeout(this.timer);
        this.#setTimer();         
  
        this.sendAlerts(this.#alerts.DateChange);
        this.client.emit(ActivityEvents.ChangedDate, this, this.date);
        this.refreshMessage({date:true});      
    }

    getDateString(){
        if (this.date instanceof Date){
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
        } else {
            return this.date;
        }        
    }

    //рассылка оповещений в личные сообщения
    async sendAlerts(reason){
        if (!this.message){
            return;
        }
        switch(reason){
            case 0:
                for (const member of this.members){
                    if (member[0] == this.leader.id) continue;
                    this.#sendMessage({member: member[1], message: `Активность «${this}» была отменёна пользователем ${this.leader}.`, header: 'Уведомление'});
                }
                if (this.bronList && this.bronList.size > 0){
                    for (const bronned of this.bronList){
                        this.#sendMessage({member: bronned[1], message: `Активность «${this}» была отменёна пользователем ${this.leader}.\nВы получаете это сообщение, потому что имеете бронь в сборе.`, header: 'Уведомление'});
                    }
                }
                break;
            case 1:
                for (const member of this.members){
                    this.#sendMessage({member: member[1], message: `Активность «${this}» была отменёна администратором. Более подробная информация в канале сбора.`, header: 'Уведомление'});
                }
                if (this.bronList && this.bronList.size > 0){
                    for (const bronned of this.bronList){
                        this.#sendMessage({member: bronned[1], message: `Активность «${this}» была отменёна администратором. Более подробная информация в канале сбора.\nВы получаете это сообщение, потому что имеете бронь в сборе.`, header: 'Уведомление'});
                    }
                }
                break;
            case 2:
                for (const member of this.members){
                    this.#sendMessage({member: member[1], message: `Активность «${this}» начнётся в ближайшие **10 минут**!`, header: 'Уведомление'});
                }
                if (this.bronList && this.bronList.size > 0){
                    for (const bronned of this.bronList){
                        this.#sendMessage({member: bronned[1], message: `Активность «${this}» начнётся в ближайшие **10 минут**!\nВы получаете это сообщение, потому что имеете бронь в сборе.`, header: 'Уведомление'});
                    }
                }
                if (this.reservs && this.state != this.#states[2] && this.reservs.size > 0){
                    for (const reserved of this.reservs){
                        this.#sendMessage({member: reserved[1], message: `Активность «${this}» начнётся в ближайшие **10 минут**!\nВы получаете это сообщение, потому что вы записаны в резерв и боевая группа меньше необходимого.`, header: 'Уведомление'});
                    }
                }
                break;
            case 3:
                for (const member of this.members){
                    this.#sendMessage({member: member[1], message: `Активность «${this}» готова к старту!`, header: 'Уведомление'});
                }
                break;
            case 4:
                for (const member of this.members){
                    if (member[0] == this.leader.id) continue;
                    this.#sendMessage({member: member[1], message: `Активность «${this}» перенесёна пользователем ${this.leader}! Новое время: ${this.getDateString()}.`, header: 'Уведомление'});
                }
                if (this.bronList.size > 0){
                    for (const bronned of this.bronList){
                        this.#sendMessage({member: bronned[1], message: `Активность «${this}» перенесёна пользователем ${this.leader}! Новое время: ${this.getDateString()}.\nВы получаете это сообщение, потому что имеете бронь в сборе.`, header: 'Уведомление'});
                    }
                }
                break;
        }
    }

    async #sendMessage({member, message, header}){
        const embed = this.client.genEmbed(message, header);
        member.send({embeds:[embed, this.message.embeds[0]]})
        .catch(err =>{
            console.log(`Ошибка рассылки для пользователя ${member.user.tag}: ${err.message}`);
            this.clan.config.sendLog(`Ошибка рассылки для пользователя ${member.user.tag}:\n${err.message}`, 'Запись логов: ошибка');
        });
    }

    async refreshMessage({members, reservs, date, leader}){
        this.checkQuantity();      
        const embed = this.message.embeds[0];
        embed.fields[1].value = `*${this.state}*`;
        if (members) embed.fields[3].value = this.getMembersString();
        if (this.reservs && reservs) embed.fields[4].value = this.getReservsString();
        if (date) embed.fields[0].value = this.getDateString();
        if (leader) embed.fields[2].value = `${this.leader}`;
        this.message.edit({embeds: [embed]}).catch(async err =>{
            console.log(`Ошибка изменения сбора ${this}: ${err.message}`);
            this.clan.config.sendLog(`Обновление сообщения сбора ${this} не удалось:\n${err.message}`, 'Запись логов: ошибка');
        });
        this.client.emit(ActivityEvents.MessageRefreshed, this);
    }

    close(){
        this.state = this.#states[0];
        const embed = this.message.embeds[0];
        embed.fields[1].value = `*${this.state}*`;
        this.client.emit(ActivityEvents.Closed, this);
        if (this.delTimer){
            clearTimeout(this.delTimer);
        }
        this.delTimer = setTimeout(() => {
            this.delete();
        }, this.#day);
        this.message.edit({content: '', embeds: [embed], components: []}).catch(async err =>{
            this.clan.config.sendLog(`Закрытие сбора ${this} не удалось:\n${err.message}`, 'Запись логов: ошибка');
            console.log(`Ошибка закрытия сбора ${this}: ${err.message}`);
        }); 
        this.client.emit(ActivityEvents.MessageRefreshed, this);
    }

    start(){
        this.state = this.#states[4];
        this.sendAlerts(this.#alerts.Start);
        if (this.delTimer){
            clearTimeout(this.delTimer);
        }
        this.delTimer = setTimeout(() => {
            this.close();
        }, this.#day/8);
        this.refreshMessage({members: true});
        this.client.emit(ActivityEvents.Started, this);
    }

    cancel(){
        if (this.state == this.#states[0] || this.state == this.#states[3] || this.state == this.#states[5]){
            throw this.#genError('Этот сбор уже не может быть отменён!');
        }
        this.state = this.#states[3];
        const embed = this.message.embeds[0];
        embed.fields[1].value = `*${this.state}*`;
        if (this.delTimer){
            clearTimeout(this.delTimer);
        }
        this.delTimer = setTimeout(() => {
            this.delete();
        }, 60000);
        this.sendAlerts(this.#alerts.Delete);
        this.message.edit({content: '', embeds: [embed], components: []}).catch(async err =>{
            this.clan.config.sendLog(`Отмена сбора ${this} не удалась:\n${err.message}`, 'Запись логов: ошибка');
            console.log(`Ошибка отмены сбора ${this}: ${err.message}`);
        }); 
        this.client.emit(ActivityEvents.MessageRefreshed, this);
    }

    adminCancel(){
        if (this.state == this.#states[0] || this.state == this.#states[3] || this.state == this.#states[5]){
            throw this.#genError('Этот сбор уже не может быть отменён! Даже админом, да.');
        }
        this.state = this.#states[5];
        const embed = this.message.embeds[0];
        embed.fields[1].value = `*${this.state}*`;
        if (this.delTimer){
            clearTimeout(this.delTimer);
        }
        this.delTimer = setTimeout(() => {
            this.delete();
        }, 60000);
        this.sendAlerts(this.#alerts.AdminDelete);
        this.message.edit({content: '', embeds: [embed], components: []}).catch(async err =>{
            this.clan.config.sendLog(`Админская отмена сбора ${this} не удалась:\n${err.message}`, 'Запись логов: ошибка');
            console.log(`Ошибка отмены сбора ${this}: ${err.message}`);
        }); 
    }

    async delete(){
        clearTimeout(this.delTimer); 
        this.clan.config.sendArchive(this.message);
        this.clan.activities.delete(this);
        this.message.delete()
        .then(() => this.clan.config.sendLog(`Автоматическое удаление сбора ${this}`, 'Запись логов: уведомление'))
        .catch(async err =>{
            console.log(`Ошибка автоматического удаления сообщения сбора ${this}: ${err.message}`);
            this.clan.config.sendLog(`Автоматическое удаление сбора ${this} не удалось:\n${err.message}`, 'Запись логов: ошибка');
        });     
        this.client.emit(ActivityEvents.Deleted, this);
    }

    #genError(message){
        const err = new Error(message);
        this.client.emit(ActivityEvents.Error, this, err, this.leader);
        return err; 
    }

    //вспомогательный метод для создания строки с участниками боевой группы
    getMembersString(){
        let str = '';
        if (this.members.size == 0){
            return '...';
        }
        this.members.forEach(function(value1){
            str += `${value1}\n`;
        });
        if (this.bronList && this.bronList.size > 0){
            this.bronList.forEach(function(value1){
                str += `#бронь (${value1})\n`;
            });
        }  
        return str; //возвращает строку со всеми участниками боевой группы в столбик
    }

    getReservsString(){
        let str = '';
        if (this.reservs.size == 0){
            return '...';
        }
        this.reservs.forEach(function(value1){
            str += `${value1}\n`;
        });
        return str; //возвращает строку со всеми резервистами в столбик
    }

    toString(){
        return `${this.name} (ID: ${this.id})`;
    }

    createEmbed(color, descript, banner, media){
        const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(this.name)
        .setDescription(descript)
        .addFields(
            {name: 'Время и дата', value: `${this.getDateString()}`, inline: false},
            {name: 'Статус', value: `*${this.state}*`, inline: true},
            {name: 'Лидер', value: `${this.leader}`, inline: true},
            {name: 'Участники', value: `${this.getMembersString()}`, inline: false}
        )
        .setFooter({text: `ID: ${this.id}`});
        if (this.reservs){
            embed.addFields({name: 'Резерв', value: `...`, inline: false})
        }
        if (banner){
            embed.setThumbnail(banner)
        }
        if (media){
            embed.setImage(media);
        }
        return embed;
    }   

    createActionRow(){
        const row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`activity_go_${this.id}`)
                .setLabel('Я точно иду!')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`activity_cancel_${this.id}`)
                .setLabel('Я передумал')
                .setStyle(ButtonStyle.Danger)           
        );  
        if (this.reservs){
            row.addComponents(
                new ButtonBuilder()
                .setCustomId(`activity_reserv_${this.id}`)
                .setLabel('Резерв')
                .setStyle(ButtonStyle.Secondary),
            );
        }              
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`activityLead_settings_${this.id}`)
                .setLabel('Настройки')
                .setStyle(ButtonStyle.Secondary) 
        );
        return row;
    }
    
    createSettingsRow(){
        const row = new ActionRowBuilder();
        if (this.date instanceof Date){
            row.addComponents(
                new ButtonBuilder()
                .setCustomId(`activityLead_changeDate_${this.id}`)
                .setLabel('Перенести')
                .setStyle(ButtonStyle.Secondary)      
            );
        } 

        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`activityLead_changeLeader_${this.id}`)
                .setLabel('Передать лид.')
                .setStyle(ButtonStyle.Secondary),                    
            new ButtonBuilder()
                .setCustomId(`activityLead_close_${this.id}`)
                .setLabel('Отменить')
                .setStyle(ButtonStyle.Danger)
        )
        
        if (this.bronList){
            const row2 = new ActionRowBuilder();
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(`activityLead_bronAdd_${this.id}`)
                    .setLabel('Добавить бронь')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`activityLead_bronDelete_${this.id}`)
                    .setLabel('Удалить бронь')
                    .setStyle(ButtonStyle.Secondary)
            );
            return [row, row2];
        }
         
        return row;
    } 
}