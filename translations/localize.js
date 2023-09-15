import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

// Define your translations
const translations = {
  'nb': require('./nb.json'), // Assuming you have a nb.json file with your translations
};

// Instantiate I18n
const i18n = new I18n(translations);

// Set the locale
const currentLocale = getLocales()[0].languageCode;
i18n.defaultLocale = 'nb'; // Set default locale
i18n.locale = currentLocale; // Set current locale

console.log(`Current locale: ${currentLocale}`);

// Memoized localization function
export const localize = memoize(
  (key, config) =>
    i18n.t(key, config).includes('missing') ? key : i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);
