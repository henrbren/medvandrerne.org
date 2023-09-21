const getActivityIconName = (activityType) => {
  switch (activityType) {
    case 'BasicPuppy':
      return 'paw';
    case 'HouseTraining':
      return 'home';
    case 'Socialization':
      return 'users';
    case 'BasicObedience':
      return 'check-circle';
    case 'RecallTraining':
      return 'bell';
    case 'LeashWalking':
      return 'road';
    case 'SitStay':
    case 'DownStay':
    case 'StandStay':
      return 'hand-paper';
    case 'HandSignals':
      return 'hand-point-right';
    case 'ClickerTraining':
      return 'mouse-pointer'; // Ingen perfekt match, men nærmest for "klikk"
    case 'Agility':
      return 'bolt';
    case 'Tracking':
    case 'NoseWork':
      return 'search';
    case 'RallyObedience':
      return 'flag';
    case 'FreestyleTricks':
      return 'music';
    case 'WaterRescue':
      return 'life-ring';
    case 'TherapyDog':
      return 'heart';
    case 'GuardProtection':
      return 'shield-alt';
    case 'HuntTraining':
      return 'tree';
    case 'AdvancedObedience':
      return 'award';
    default:
      return 'question-circle';
  }
};

export default getActivityIconName;
