const {GuardianEvents} = require('../fireteams_module');

module.exports = {
    name: GuardianEvents.Deleted,
    async execute(guardian) {
        guardian.clan.config.sendLog(`Удалён страж ${guardian}`, 'Запись логов: уведомление');
    },
};