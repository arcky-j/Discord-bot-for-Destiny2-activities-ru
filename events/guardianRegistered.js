const {GuardianEvents} = require('../fireteams_module');

module.exports = {
    name: GuardianEvents.Registered,
    async execute(guardian) {
        guardian.clan.config.sendLog(`Зарегистрирован страж ${guardian}`, 'Запись логов: уведомление');
    },
};