const getMedicineIconName = (medicineType) => {
  switch (medicineType) {
    case 'Deworming':
      return 'bug';
    case 'Vaccination':
      return 'syringe';
    case 'AntiFleasTicks':
      return 'spider';
    case 'PainReliever':
      return 'tablet-alt';
    case 'Antibiotics':
      return 'capsules';
    case 'AntiInflammatory':
      return 'fire-alt';
    case 'SkinOintment':
      return 'allergies';
    case 'EarDrops':
      return 'otter';
    case 'EyeDrops':
      return 'eye-dropper';
    case 'AllergyMedicine':
      return 'wind';
    case 'VitaminsSupplements':
      return 'apple-alt';
    case 'AntiParasitic':
      return 'virus';
    case 'AntiFungal':
      return 'fungus';
    case 'Hormonal':
      return 'balance-scale';
    case 'Sedatives':
      return 'procedures';
    case 'AntiEpileptic':
      return 'brain';
    case 'Gastrointestinal':
      return 'stomach';
    case 'AntiAnxiety':
      return 'spa';
    case 'MuscleRelaxants':
      return 'hand-paper';
    case 'Insulin':
      return 'syringe';
    case 'Diuretics':
      return 'tint';
    case 'HeartwormPrevention':
      return 'heartbeat';
    case 'Chemotherapy':
      return 'radiation';
    case 'Immunosuppressant':
      return 'shield-virus';
    case 'DentalCare':
      return 'tooth';
    case 'Supplements':
      return 'pill';
    case 'Other':
      return 'ellipsis-h';
    default:
      return 'question-circle';
  }
};

export default getMedicineIconName;
