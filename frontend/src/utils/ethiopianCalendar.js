// Ethiopian Calendar Utilities

const ethiopianMonths = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
];

// Convert Gregorian date to Ethiopian date
export function gregorianToEthiopian(gregorianDate) {
  const date = new Date(gregorianDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Ethiopian year is 7-8 years behind Gregorian
  let ethYear = year - 8;
  
  // Ethiopian New Year (Meskerem 1) = September 11 (Gregorian)
  let ethMonth, ethDay;
  
  if (month >= 9) {
    // September to December
    if (month === 9 && day < 11) {
      // Before Sept 11: previous Ethiopian year
      ethYear = year - 9;
      ethMonth = 13; // Pagume
      ethDay = day + 25;
    } else {
      ethMonth = month - 8; // Sept=1, Oct=2, Nov=3, Dec=4
      ethDay = day - 10;
      if (ethDay <= 0) {
        ethDay += 30;
        ethMonth -= 1;
      }
    }
  } else {
    // January to August
    ethMonth = month + 4; // Jan=5, Feb=6, Mar=7, Apr=8, May=9, Jun=10, Jul=11, Aug=12
    ethDay = day - 7; // Offset for Ethiopian calendar
    
    if (ethDay <= 0) {
      ethDay += 30;
      ethMonth -= 1;
    }
  }
  
  return { year: ethYear, month: ethMonth, day: ethDay };
}

// Get current Ethiopian month info
export function getCurrentEthiopianMonth() {
  const today = new Date();
  const ethDate = gregorianToEthiopian(today);
  
  return {
    year: ethDate.year,
    month: ethDate.month,
    monthName: ethiopianMonths[ethDate.month - 1],
    day: ethDate.day
  };
}

// Get first and last day of current Ethiopian month in Gregorian format
export function getCurrentEthiopianMonthRange() {
  const current = getCurrentEthiopianMonth();
  
  // For simplicity, we'll use the current Gregorian month's first and last day
  // as an approximation (you can implement exact conversion if needed)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    ethiopianMonth: current.monthName,
    ethiopianYear: current.year,
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0],
    displayText: `${current.monthName} ${current.year}`
  };
}

// Format Ethiopian date for display
export function formatEthiopianDate(ethDate) {
  return `${ethDate.day} ${ethiopianMonths[ethDate.month - 1]} ${ethDate.year}`;
}

// Get Ethiopian month name from month number
export function getEthiopianMonthName(monthNumber) {
  return ethiopianMonths[monthNumber - 1] || 'Unknown';
}

// Convert Ethiopian date to Gregorian date
export function ethiopianToGregorian(ethYear, ethMonth, ethDay) {
  // Ethiopian year is 7-8 years behind
  let gregYear = ethYear + 8;
  
  let gregMonth, gregDay;
  
  if (ethMonth >= 1 && ethMonth <= 4) {
    // Meskerem to Tahsas (Sept-Dec)
    gregMonth = ethMonth + 8; // 1=Sept, 2=Oct, 3=Nov, 4=Dec
    gregDay = ethDay + 10;
    
    if (gregDay > 30) {
      gregDay -= 30;
      gregMonth += 1;
    }
  } else if (ethMonth >= 5 && ethMonth <= 12) {
    // Tir to Nehase (Jan-Aug)
    gregMonth = ethMonth - 4; // 5=Jan, 6=Feb, 7=Mar, etc.
    gregDay = ethDay + 7;
    
    // Adjust for month-specific days
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (gregDay > daysInMonth[gregMonth - 1]) {
      gregDay -= daysInMonth[gregMonth - 1];
      gregMonth += 1;
    }
  } else {
    // Pagume (13th month)
    gregMonth = 9; // September
    gregDay = ethDay - 25;
    if (gregDay <= 0) {
      gregMonth = 8; // August
      gregDay += 31;
    }
  }
  
  return new Date(gregYear, gregMonth - 1, gregDay);
}

// Get Gregorian date range for an Ethiopian month
export function getGregorianRangeForEthiopianMonth(ethYear, ethMonth) {
  // Get first day of Ethiopian month
  const startDate = ethiopianToGregorian(ethYear, ethMonth, 1);
  
  // Get last day of Ethiopian month (30 days for months 1-12, 5-6 for Pagume)
  const lastDay = ethMonth === 13 ? 5 : 30;
  const endDate = ethiopianToGregorian(ethYear, ethMonth, lastDay);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    ethiopianMonth: ethiopianMonths[ethMonth - 1],
    ethiopianYear: ethYear
  };
}
