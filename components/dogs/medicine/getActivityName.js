

import { localize } from "@translations/localize";

const getActivityName = (activityType) => {
  return localize(`main.screens.dogDetail.medicine.medicineTypes.${activityType}`);
};

export default getActivityName;

