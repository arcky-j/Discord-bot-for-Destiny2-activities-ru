const activityEvents = require('./consts/activityEvents');
const guardianEvents = require('./consts/guardianEvents');
const activityErrors = require('./consts/activityErrors');

const Base = require('./classes/base');
const Activity = require('./classes/activity');
const Settings = require('./classes/settings');
const Clan = require('./classes/clan');
const Guardian = require('./classes/guardian');


const actManager = require('./managment/actManager');
const clanManager = require('./managment/clanManager')

const getRandomColor = require('./utility/get_random_color');

const activityButtonsHandle = require('./handlers/activityButtons');

module.exports = {
    Base: Base,
    Activity: Activity,
    Settings: Settings,
    Guardian: Guardian,
    Clan: Clan,

    ActivitiesManager: actManager,
    ClanManager: clanManager,

    getRandomColor: getRandomColor,

    activityButtonsHandle: activityButtonsHandle,

    ActivityEvents: activityEvents,
    ActivityErrors: activityErrors,
    GuardianEvents: guardianEvents
}