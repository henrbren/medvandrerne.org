// DateUtils.js
import { localize } from "@translations/localize";

export function formatDateWithTime(date) {
    if (!date) return null;
  
    const dateObject = (date instanceof Date) ? date : new Date(date);
  
    const day = String(dateObject.getDate()).padStart(2, '0');
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = dateObject.getFullYear();
  
    const hours = String(dateObject.getHours()).padStart(2, '0');
    const minutes = String(dateObject.getMinutes()).padStart(2, '0');
    const seconds = String(dateObject.getSeconds()).padStart(2, '0');
  
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  }

  export function formatDate(date) {
    if (!date) return null;
  
    const dateObject = (date instanceof Date) ? date : new Date(date);
  
    const day = String(dateObject.getDate()).padStart(2, '0');
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = dateObject.getFullYear();
  
    const hours = String(dateObject.getHours()).padStart(2, '0');
    const minutes = String(dateObject.getMinutes()).padStart(2, '0');
    const seconds = String(dateObject.getSeconds()).padStart(2, '0');
  
    return `${day}.${month}.${year}`;
  }
  
  
  export function calculateDetailedAge(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
  
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();
  
    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
  
    if (months < 0) {
      years--;
      months += 12;
    }
  
    return { years, months, days };
  }
  
  export function generateAgeString(age) {
    const ageParts = [];
  
    if (age.years > 0) {
      ageParts.push(`${age.years} ${localize('main.dates.year')}`);
    }
  
    if (age.months > 0) {
      ageParts.push(`${age.months} ${localize('main.dates.month')}`);
    }
  
    if (age.days > 0) {
      ageParts.push(`${age.days} ${localize('main.dates.days')}`);
    }
  
    let ageString = '';
    if (ageParts.length > 1) {
      const lastPart = ageParts.pop();
      ageString = `${ageParts.join(', ')}, og ${lastPart}`;
    } else {
      ageString = ageParts.join(', ');
    }
  
    return ageString;
  }

  export function calculateAgeInWeeks(birthDate, currentDate = new Date()) {
    if (!birthDate) return null;
  
    const birthDateObject = (birthDate instanceof Date) ? birthDate : new Date(birthDate);
    const currentDateObject = (currentDate instanceof Date) ? currentDate : new Date(currentDate);
  
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    const timeDifference = currentDateObject - birthDateObject;
  
    const weeksOld = Math.floor(timeDifference / millisecondsPerWeek);
  
    return weeksOld;
  }