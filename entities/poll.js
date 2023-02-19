//класс, представляющий голосование
class Poll{
    id;
    theme; //тема и заголовок голосования
    creator; //автор голосования
    isChangeble; //можно ли менять голос?
    isAnon; //анонимно ли голосование?
    voters = new Map(); //все проголосовавшие

    constructor(id, theme, creator, isChange, isAn){
        this.id = id;
        this.theme = theme;
        this.creator = creator;
        this.isChangeble = isChange;
        this.isAnon = isAn; 
    }
    //метод для добавления нового голоса или изменения старого
    addVoter(us, choiceId){
        if (this.voters.has(us.id)){ //проверка голосования за этот вариант
            if (this.voters.get(us.id).choiceId == choiceId){
                throw new Error('Вас голос уже отдан за этото вариант!');
            }
            if (this.isChangeble){ //если голос изменить можно, то удаляет из списка голосовавших для последующей замены
                this.voters.delete(us.id); 
            } else {
                throw new Error('В данном голосовании нельзя изменить выбор!');
            }
        }
        this.voters.set(us.id, new Voter(choiceId, us)); //записывает нового голосующего
    }
    //методы для отображения списка проголосовавших
    //для каждого варианта отдельный, ничего более простого и изящного я не придумал
    getVotersString0(){
        let str = '';
        let vC = 0;
        this.voters.forEach((val, id) => {
            if (val.choiceId == 0){
                str += `<@${val.user.id}>\n`;
                vC++;
            }
        });
        if (vC == 0){
            return 'Никого'; //даже если никто не проголосовал, дискорду необходимо ввести значение в поле embed'а
        }
        if (this.isAnon){
            return `${vC}`; //если голосование анонимно, просто возвращает количество голосов
        }       
        return str; //возвращает строку со всеми проголосовавшими за первый вариант в столбик
        //все 5 методов работают одинакого, лишь возвращают строки для разных вариантов
        //можно было бы вместо одного словаря сделать двумерный массив, но тогда проверка бы занимала больше кода
        //уверен, что есть какое-то совсем простое решение, но мне оно пока в голову не пришло
    }

    getVotersString1(){
        let str = '';
        let vC = 0;
        this.voters.forEach((val, id) => {
            if (val.choiceId == 1){
                str += `<@${val.user.id}>\n`;
                vC++;
            }
        });
        if (vC == 0){
            return 'Никого';
        }
        if (this.isAnon){
            return `${vC}`;
        }
        return str;
    }

    getVotersString2(){
        let str = '';
        let vC = 0;
        this.voters.forEach((val, id) => {
            if (val.choiceId == 2){
                str += `<@${val.user.id}>\n`;
                vC++;
            }
        });
        if (vC == 0){
            return 'Никого';
        }
        if (this.isAnon){
            return `${vC}`;
        }
        return str;
    }

    getVotersString3(){
        let str = '';
        let vC = 0;
        this.voters.forEach((val, id) => {
            if (val.choiceId == 3){
                str += `<@${val.user.id}>\n`;
                vC++;
            }
        });
        if (vC == 0){
            return 'Никого';
        }
        if (this.isAnon){
            return `${vC}`;
        }
        return str;
    }

    getVotersString4(){
        let str = '';
        let vC = 0;
        this.voters.forEach((val, id) => {
            if (val.choiceId == 4){
                str += `<@${val.user.id}>\n`;
                vC++;
            }
        });
        if (vC == 0){
            return 'Никого';
        }
        if (this.isAnon){
            return `${vC}`;
        }
        return str;
    }

}
//вспомогательный класс, который к ссылке на пользователя крепит ещё и его выбор в голосовании
//можно было и напрямую к пользователю это прикрепить, но возникнет странная ситуация при нескольких голосованиях
class Voter{
    choiceId;
    user;

    constructor(id, us){
        this.choiceId = id;
        this.user = us;
    }
}

module.exports = Poll;