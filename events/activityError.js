const {ActivityEvents, Guardian} = require('../fireteams_module');

module.exports = {
    name: ActivityEvents.Error,
    async execute(fireteam, error, leader) {
        fireteam.clan.config.sendLog(`Вызвана ошибка в ${fireteam}:\n${error.message}\nЛидер сбора: ${leader}`, 'Запись логов: ошибка');
    },
};