/**
 * Detect user's country using browser geolocation API
 * Falls back to manual selection if geolocation fails
 */
export const detectCountry = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        try {
          // Use reverse geocoding API to get country from coordinates
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
          );
          const data = await response.json();
          resolve(data.countryCode || null);
        } catch (error) {
          console.error('Error detecting country:', error);
          resolve(null);
        }
      },
      (error: GeolocationPositionError) => {
        console.error('Geolocation error:', error);
        resolve(null);
      },
      { timeout: 5000 }
    );
  });
};

/**
 * Get country code from IP (fallback method)
 */
export const detectCountryFromIP = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.error('Error detecting country from IP:', error);
    return null;
  }
};

/**
 * Main function to detect country with fallbacks
 */
export const getCountryCode = async (): Promise<string | null> => {
  // Try geolocation first
  let countryCode = await detectCountry();
  
  // Fallback to IP-based detection
  if (!countryCode) {
    countryCode = await detectCountryFromIP();
  }
  
  return countryCode;
};

