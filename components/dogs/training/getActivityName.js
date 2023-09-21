

import { localize } from "@translations/localize";

const getActivityName = (activityType) => {
  return localize(`main.screens.dogDetail.training.trainingTypes.${activityType}`);
};

export default getActivityName;

