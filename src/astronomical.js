/*
STARPATH.JS - Astronomical Coordinate Calculations (ES6 Module)
This file contains functions to calculate the position of celestial objects 
(stars, planets, nebulae) in the sky as viewed from a specific location on Earth.

Key concepts:
- Right Ascension (RA) & Declination (Dec): Celestial coordinates (like lat/lon for the sky)
- Azimuth & Elevation: Local sky coordinates from observer's perspective
- Julian Date: Astronomical time standard for calculations
- Sidereal Time: Time based on Earth's rotation relative to distant stars
*/

// Convert JavaScript Date object to Julian Date (astronomical time standard)
// Julian Date is days since noon on January 1, 4713 BCE (used in astronomy)
// Source: http://stackoverflow.com/a/11760079/500207
export const getJulian = (date) => date.getTime() / 86400000 + 2440587.5;

// Trigonometric helper functions that work with degrees instead of radians
export const sind = (deg) => Math.sin(deg * Math.PI / 180);    // sine of degrees
export const cosd = (deg) => Math.cos(deg * Math.PI / 180);    // cosine of degrees  
export const asind = (x) => Math.asin(x) * 180 / Math.PI;      // arcsine returning degrees
export const mod = (a, b) => a % b;                            // modulo operation

/*
Convert celestial coordinates (RA/Dec) to local sky coordinates (Azimuth/Elevation)
This is the core function that tells us where in the sky an object appears
from a specific location on Earth at a specific time.

Parameters:
  Ra:  Right Ascension in degrees (celestial "longitude", 0-360°)
  Dec: Declination in degrees (celestial "latitude", -90° to +90°) 
  lat: Observer's latitude in degrees
  lon: Observer's longitude in degrees (positive = East)
  dateObj: JavaScript Date object for the observation time

Returns:
  {az: azimuth_degrees, el: elevation_degrees}
  - Azimuth: compass direction (0°=North, 90°=East, 180°=South, 270°=West)
  - Elevation: angle above horizon (0°=horizon, 90°=directly overhead)

Source: http://www.mathworks.com/matlabcentral/fileexchange/26458
*/
export function RaDec2AzEl(Ra, Dec, lat, lon, dateObj) {
  // Convert observation time to Julian Date
  const JD = getJulian(dateObj);
  
  // Calculate time in centuries since J2000.0 epoch (Jan 1, 2000, noon UTC)
  const T_UT1 = (JD - 2451545) / 36525;
  
  // Calculate Greenwich Mean Sidereal Time (GMST) using polynomial formula
  // Sidereal time tracks Earth's rotation relative to distant stars
  let ThetaGMST = 67310.54841 + (876600 * 3600 + 8640184.812866) * T_UT1 +
                  0.093104 * Math.pow(T_UT1, 2) - 6.2e-6 * Math.pow(T_UT1, 3);
  
  // Normalize GMST to 0-360 degrees
  ThetaGMST = mod(
      (mod(ThetaGMST, 86400 * (ThetaGMST / Math.abs(ThetaGMST))) / 240), 360);
  
  // Calculate Local Sidereal Time by adding observer's longitude
  const ThetaLST = ThetaGMST + lon;

  // Calculate Local Hour Angle: how far the object has moved from local meridian
  const LHA = mod(ThetaLST - Ra, 360);

  // Calculate elevation using spherical trigonometry
  // This gives the angle above the horizon
  const El = asind(sind(lat)*sind(Dec) + cosd(lat)*cosd(Dec)*cosd(LHA));

  // Calculate azimuth using spherical trigonometry  
  // This gives the compass direction (0°=North, clockwise)
  const Az = mod(
      Math.atan2(-sind(LHA) * cosd(Dec) / cosd(El),
                 (sind(Dec) - sind(El) * sind(lat)) / (cosd(El) * cosd(lat))) *
          (180 / Math.PI),
      360);
  
  return {az : Az, el : El};
}

// Convert Hours:Minutes:Seconds to decimal degrees
// Used for Right Ascension (multiply by 15 because 24h = 360°, so 1h = 15°)
export const hmsToDeg = (h, m, s) => (h + m / 60 + s / 3600) * (15 / 1);

// Convert Degrees:Minutes:Seconds to decimal degrees  
// Used for Declination and Earth coordinates (latitude/longitude)
export const dmsToDeg = (d, m, s) => d + m / 60 + s / 3600;

// Define celestial coordinates for objects of interest

// The Sun's position (changes throughout the year, this is one specific time)
export const solCelestial = {
  ra : hmsToDeg(13, 42, 32.13),    // Right Ascension: 13h 42m 32.13s
  dec : dmsToDeg(-10, 59, 55.2)    // Declination: -10° 59' 55.2"
};

// The Fireworks Nebula (NGC 6302) - a beautiful planetary nebula in Scorpius
// These coordinates are essentially fixed (stars don't move appreciably over human timescales)
export const fireworksCelestial = {
  ra : hmsToDeg(20, 35, 25),       // Right Ascension: 20h 35m 25s
  dec : dmsToDeg(60, 14, 47)       // Declination: +60° 14' 47" 
};

// Polaris (the North Star) - α Ursae Minoris
// Located very close to the North Celestial Pole, appears nearly stationary
export const polarisCelestial = {
  ra : hmsToDeg(2, 31, 49),        // Right Ascension: 2h 31m 49s
  dec : dmsToDeg(89, 15, 51)       // Declination: +89° 15' 51" (very close to +90°)
};

// Observer location: Dunstable, Massachusetts, USA
export const dunstableMAUsaLatLong = {
  lat : dmsToDeg(42, 41, 1),       // Latitude: 42° 41' 1" N
  lon : -dmsToDeg(71, 28, 16)      // Longitude: 71° 28' 16" W (negative for West)
};

// Helper function: Calculate position of any celestial object at any time from Dunstable, MA
export const calculatePositionAtTime = (date, {ra, dec}) => RaDec2AzEl(
    ra, dec, dunstableMAUsaLatLong.lat, dunstableMAUsaLatLong.lon, date);

// Helper function: Calculate position of Fireworks Nebula at any specific time from Dunstable, MA  
export const calculateFireworksPosition = (date) =>
    RaDec2AzEl(fireworksCelestial.ra, fireworksCelestial.dec,
               dunstableMAUsaLatLong.lat, dunstableMAUsaLatLong.lon, date);

/*
GENERATE DATA FOR VISUALIZATION
Create arrays of sky positions over time to show how celestial objects move
*/

// Utility function to add time units to a date
// Example: addTime(5, someDate, 'setHours', 'getHours') adds 5 hours
export const addTime = (amount, date, setter, getter) => {
    const newDate = new Date(date);
    newDate[setter](newDate[getter]() + amount);
    return newDate;
};

// Generate array of 24 Date objects, one for each hour of a day starting from 'start'
export const generateHourlyDates = (startDate) => {
    const dates = [];
    for (let h = 0; h < 24; h++) {
        dates.push(addTime(h, startDate, 'setHours', 'getHours'));
    }
    return dates;
};

// Generate array of Date objects for nighttime hours only (6 PM to 6 AM)
export const generateNighttimeDates = (startDate) => {
    const dates = [];
    // Generate hours from 18:00 (6 PM) to 23:59 (11:59 PM)
    for (let h = 18; h < 24; h++) {
        dates.push(addTime(h, startDate, 'setHours', 'getHours'));
    }
    // Generate hours from 00:00 (midnight) to 05:59 (5:59 AM)
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    for (let h = 0; h < 6; h++) {
        dates.push(addTime(h, nextDay, 'setHours', 'getHours'));
    }
    return dates;
};

// Generate array of Date objects for custom time range
export const generateCustomTimeDates = (startDate, startHour, endHour) => {
    const dates = [];
    
    // Helper function to create a date with a specific hour
    const createDateWithHour = (baseDate, hour) => {
        const newDate = new Date(baseDate);
        newDate.setHours(hour, 0, 0, 0); // Set hour, reset minutes/seconds/ms to 0
        return newDate;
    };
    
    if (startHour <= endHour) {
        // Same day range (e.g., 8 AM to 6 PM)
        for (let h = startHour; h <= endHour; h++) {
            dates.push(createDateWithHour(startDate, h));
        }
    } else {
        // Cross-midnight range (e.g., 7 PM to 4 AM)
        // Generate hours from start to end of day
        for (let h = startHour; h < 24; h++) {
            dates.push(createDateWithHour(startDate, h));
        }
        // Generate hours from start of next day to end hour
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        for (let h = 0; h <= endHour; h++) {
            dates.push(createDateWithHour(nextDay, h));
        }
    }
    return dates;
};

// Generate position data for celestial objects over time
export const generatePositionData = (celestialObject, startDate = new Date()) => {
    const dateVec = generateHourlyDates(startDate);
    return dateVec.map(date => calculatePositionAtTime(date, celestialObject));
};

// Generate position data for celestial objects during nighttime hours only (6 PM to 6 AM)
export const generateNighttimePositionData = (celestialObject, startDate = new Date()) => {
    const dateVec = generateNighttimeDates(startDate);
    return dateVec.map(date => ({
        ...calculatePositionAtTime(date, celestialObject),
        time: date.getHours() // Store the hour for labeling
    }));
};

// Generate position data for celestial objects during custom time range
export const generateCustomTimePositionData = (celestialObject, startDate = new Date(), startHour = 18, endHour = 6) => {
    const dateVec = generateCustomTimeDates(startDate, startHour, endHour);
    return dateVec.map(date => ({
        ...calculatePositionAtTime(date, celestialObject),
        time: date.getHours() // Store the hour for labeling
    }));
};

// Pre-calculated position vectors for common objects
export const getPositionVectors = (startDate = new Date()) => ({
    fireworks: generatePositionData(fireworksCelestial, startDate),
    sol: generatePositionData(solCelestial, startDate)
});

// Pre-calculated position vectors for nighttime hours only (6 PM to 6 AM)
export const getNighttimePositionVectors = (startDate = new Date()) => ({
    fireworks: generateNighttimePositionData(fireworksCelestial, startDate),
    sol: generateNighttimePositionData(solCelestial, startDate)
});