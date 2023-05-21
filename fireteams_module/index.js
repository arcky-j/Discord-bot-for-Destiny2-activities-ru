const activityEvents = require('./consts/activityEvents');
const activityErrors = require('./consts/activityErrors');

const Base = require('./classes/base');
const ABase = require('./classes/activityBase');
const ABron = require('./classes/activityBron');
const ADate = require('./classes/activityDate');
const AUntimed = require('./classes/activityUntimed');
const ARes = require('./classes/activityRes');
const FUntimed = require('./classes/fireteamUntimed');
const FRes = require('./classes/fireteamRes');
const CActivity = require('./classes/customActivity');
const MapVote = require('./classes/mapVote');
const Settings = require('./classes/settings');
const Clan = require('./classes/clan');
const Guardian = require('./classes/guardian');


const mainActManager = require('./managment/mainActManager');
const clanManager = require('./managment/clanManager')

const dateSet = require('./utility/date_set');
const genEmbed = require('./utility/gen_embed');
const genReasonModal = require('./utility/gen_reason_modal');
const getRandomColor = require('./utility/get_random_color');
const getRandomPresence = require('./utility/get_random_presence');
const idGenerator = require('./utility/id_generator');

const activityButtonsHandle = require('./handlers/activityButtons');
const mapVoteButtonsHandle = require('./handlers/mapVoteButtons');

module.exports = {
    Base: Base,
    ActivityBase: ABase,
    ActivityBron: ABron,
    ActivityDate: ADate,
    ActivityUntimed: AUntimed,
    ActivityRes: ARes,
    FireteamUntimed: FUntimed,
    FireteamRes: FRes,
    CustomActivity: CActivity,
    MapVote: MapVote,
    Settings: Settings,
    Guardian: Guardian,
    Clan: Clan,

    MainActivitiesManager: mainActManager,
    ClanManager: clanManager,

    dateSet: dateSet,
    genEmbed: genEmbed,
    genReasonModal: genReasonModal,
    getRandomColor: getRandomColor,
    getRandomPresence: getRandomPresence,
    idGenerator: idGenerator,

    activityButtonsHandle: activityButtonsHandle,
    mapVoteButtonsHandle: mapVoteButtonsHandle,

    ActivityEvents: activityEvents,
    ActivityErrors: activityErrors
}