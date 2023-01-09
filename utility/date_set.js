//функция для работы с датой; принимает в текстовом виде время и дату и проводит массу проверок
function dateSet(timeText, dateText){
    //принимает время в формате "ЧЧ:ММ"
    if (!timeText.includes(':')){
        throw new Error('Неправильный формат времени!');
    }
    //принимает дату в формате "ДД.ММ" или "ДД.ММ.ГГ", или "ДД.ММ.ГГГГ"
    if (!dateText.includes('.')){
        throw new Error('Неправильный формат Даты!');
    }

    const hour = parseInt(timeText.split(':')[0]); //парсит часы
    const minute = parseInt(timeText.split(':')[1]); //парсит минуты

    const day = parseInt(dateText.split('.')[0]); //парсит день
    const month = parseInt(dateText.split('.')[1]); //парсит месяц

    let year;
    const today = new Date();

    if (dateText.split('.').length == 3){ //проверяет: введён ли пользователем год?
        if (dateText.split('.')[2].length == 2){
            year = parseInt('20' + dateText.split('.')[2]); //если введён в формате "ГГ", добавляет "20" - "20ГГ" и парсит
        } else if (dateText.split('.')[2].length == 4){
            year = parseInt(dateText.split('.')[2]); //если введён в формате "ГГГГ"? просто парсит
        } else {
            throw new Error('Формат года некорректен! Или пишите год целиком, или последние две цифры. Третьего не дано');
        }
    } else {
        year = today.getFullYear(); //если год не введёт, просто берёт текущий
    }

    //обычные проверки на корректность введённого времени
    //чтобы не было даты в виде 28:76 34.13.20223, например
    if (hour < 0 || hour > 23){
        throw new Error('Время сбора введено некорректно!');
    }
    if (minute < 0 || minute > 59){
        throw new Error('Время сбора введено некорректно!');
    }

    switch (month){
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12: 
            if (day < 0 || day > 31) {
                throw new Error('Дата сбора введёна некорректно!');
            }
            break;
        case 4:
        case 6:
        case 9:
        case 11:
            if (day < 0 || day > 30) {
                throw new Error('Дата сбора введёна некорректно!');
            }
            break;
        case 2: //проверка даже для високосного года - зачем?
            if (year%4 != 0){
                if (day < 0 || day > 28) {
                    throw new Error('Дата сбора введёна некорректно!');
                }
            } else {
                if (day < 0 || day > 29) {
                    throw new Error('Дата сбора введёна некорректно!');
                }
            }            
            break;
        default: throw new Error('Дата сбора введёна некорректно!');
    }
    //только после всех проверок устанавливается дата
    const activityDate = new Date(year, month - 1, day, hour, minute, 0);
    //и сразу проверяется на актуальность
    if (activityDate - today < 0){
        throw new Error('Введена прошедшая дата!');
    }

    return activityDate;
}

module.exports = dateSet;