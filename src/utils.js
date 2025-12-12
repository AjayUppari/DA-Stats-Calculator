// Utility functions for formatting and unit conversions

// Convert minutes to hours and minutes format
export const formatTimeToHoursMinutes = (minutes) => {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return 'N/A';
  
  const totalMinutes = Math.round(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

// Convert kilometers to miles
export const convertKmToMiles = (km) => {
  return km * 0.621371;
};

// Convert miles to kilometers
export const convertMilesToKm = (miles) => {
  return miles / 0.621371;
};

// Format distance based on selected unit
export const formatDistance = (value, unit = 'km') => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  
  if (unit === 'miles') {
    return convertKmToMiles(value);
  }
  return value;
};

// Get distance unit label
export const getDistanceUnitLabel = (unit = 'km') => {
  return unit === 'miles' ? 'miles' : 'km';
};

// Get distance per volume unit label
export const getDistancePerVolumeLabel = (unit = 'km') => {
  return unit === 'miles' ? 'miles/m³' : 'km/m³';
};

// Format value based on type and unit
export const formatValue = (value, type = 'number', unit = 'km') => {
  if (value === null || value === undefined) return 'N/A';
  
  switch (type) {
    case 'percentage':
      return `${Number(value).toFixed(2)}%`;
    case 'decimal':
      return Number(value).toFixed(2);
    case 'integer':
      return Math.round(Number(value)).toLocaleString();
    case 'time':
      return formatTimeToHoursMinutes(value);
    case 'distance':
      const convertedValue = formatDistance(value, unit);
      return Number(convertedValue).toFixed(0);
    case 'distance-decimal':
      const convertedDecimalValue = formatDistance(value, unit);
      return Number(convertedDecimalValue).toFixed(2);
    default:
      return Number(value).toLocaleString();
  }
};
