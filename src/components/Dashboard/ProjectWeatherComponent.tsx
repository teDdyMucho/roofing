import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/ProjectWeatherComponent.css';

// API URLs from environment variables
const GEOCODING_API_URL = process.env.REACT_APP_GEOCODING_API_URL || 'https://geocoding-api.open-meteo.com/v1/search';
const HISTORICAL_WEATHER_API_URL = process.env.REACT_APP_HISTORICAL_WEATHER_API_URL || 'https://archive-api.open-meteo.com/v1/archive';
const WEATHER_FORECAST_API_URL = process.env.REACT_APP_WEATHER_FORECAST_API_URL || 'https://api.open-meteo.com/v1/forecast';

/**
 * Interface for daily forecast data
 */
interface ForecastDay {
  day: string;
  condition: string;
  high: number;
  low: number;
  icon: string;
  isPast?: boolean;
  isToday?: boolean;
}

/**
 * Interface for weather data from API
 */
interface WeatherData {    
  address: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
  windDirection?: string;
  pressure?: number;
  visibility?: number;
  feelsLike?: number;
  dewPoint?: number;
  forecast: ForecastDay[];
}

interface ProjectWeatherProps {
  projectLocation?: string; // Optional project location from the project in Supabase
}

const ProjectWeatherComponent: React.FC<ProjectWeatherProps> = ({ projectLocation }) => {
  // Extract city name from project location for API call
  const city = projectLocation ? projectLocation.split(',')[0] : '';
  
  // State for weather data
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Convert WMO weather codes to human-readable conditions
   * @param code - WMO weather code
   * @returns Human-readable weather condition
   */
  const getWeatherCondition = useCallback((code: number): string => {
    if (code === 0) return 'clear sky';
    if (code === 1) return 'mainly clear';
    if (code === 2) return 'partly cloudy';
    if (code === 3) return 'overcast';
    if (code >= 45 && code <= 48) return 'fog';
    if (code >= 51 && code <= 55) return 'drizzle';
    if (code >= 56 && code <= 57) return 'freezing drizzle';
    if (code >= 61 && code <= 65) return 'rain';
    if (code >= 66 && code <= 67) return 'freezing rain';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 80 && code <= 82) return 'rain showers';
    if (code >= 85 && code <= 86) return 'snow showers';
    if (code >= 95 && code <= 99) return 'thunderstorm';
    return 'unknown';
  }, []);
  
  /**
   * Convert WMO weather codes to icon codes compatible with our icon system
   * @param code - WMO weather code
   * @param isDay - Whether it's daytime (true) or nighttime (false)
   * @returns Icon code string
   */
  const getWeatherIconCode = useCallback((code: number, isDay: boolean): string => {
    const daySuffix = isDay ? 'd' : 'n';
    
    if (code === 0) return `01${daySuffix}`; // clear sky
    if (code === 1) return `01${daySuffix}`; // mainly clear
    if (code === 2) return `02${daySuffix}`; // partly cloudy
    if (code === 3) return `04${daySuffix}`; // overcast
    if (code >= 45 && code <= 48) return `50${daySuffix}`; // fog
    if (code >= 51 && code <= 55) return `09${daySuffix}`; // drizzle
    if (code >= 56 && code <= 57) return `13${daySuffix}`; // freezing drizzle
    if (code >= 61 && code <= 65) return `10${daySuffix}`; // rain
    if (code >= 66 && code <= 67) return `13${daySuffix}`; // freezing rain
    if (code >= 71 && code <= 77) return `13${daySuffix}`; // snow
    if (code >= 80 && code <= 82) return `09${daySuffix}`; // rain showers
    if (code >= 85 && code <= 86) return `13${daySuffix}`; // snow showers
    if (code >= 95 && code <= 99) return `11${daySuffix}`; // thunderstorm
    return `01${daySuffix}`; // default
  }, []);
  
  /**
   * Process forecast data to get daily forecasts including historical data
   * @param dailyData - Daily forecast data from API
   * @param historicalData - Historical weather data from API
   * @returns Array of processed forecast days
   */
  const processForecastData = useCallback((dailyData: any, historicalData: any) => {
    // Generate past 5 days and future days
    const today = new Date();
    const pastDays: ForecastDay[] = [];
    const futureDays: ForecastDay[] = [];
    
    // Process historical data for past 5 days
    if (historicalData && historicalData.time && historicalData.time.length > 0) {
      const histDates = historicalData.time;
      const histWeatherCodes = historicalData.weather_code;
      const histMaxTemps = historicalData.temperature_2m_max;
      const histMinTemps = historicalData.temperature_2m_min;
      
      // Process each day in the historical data
      for (let i = 0; i < histDates.length; i++) {
        const histDate = new Date(histDates[i]);
        const dayName = histDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Get weather condition and icon based on WMO weather code
        const condition = getWeatherCondition(histWeatherCodes[i]);
        const icon = getWeatherIconCode(histWeatherCodes[i], true);
        
        pastDays.push({
          day: dayName,
          condition: condition,
          high: Math.round(histMaxTemps[i]),
          low: Math.round(histMinTemps[i]),
          icon: icon,
          isPast: true
        });
      }
    } else {
      // Fallback to simulated data if historical data is not available
      for (let i = 5; i > 0; i--) {
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - i);
        
        pastDays.push({
          day: pastDate.toLocaleDateString('en-US', { weekday: 'short' }),
          condition: 'historical data unavailable',
          high: Math.round(15 + Math.random() * 5), // Simulated past data
          low: Math.round(10 + Math.random() * 3),
          icon: '01d', // Default to sunny for past days
          isPast: true
        });
      }
    }
    
    // Process actual forecast data from Open-Meteo
    const forecastDates = dailyData.time;
    const weatherCodes = dailyData.weather_code;
    const maxTemps = dailyData.temperature_2m_max;
    const minTemps = dailyData.temperature_2m_min;
    
    // Process each day in the forecast
    for (let i = 0; i < forecastDates.length; i++) {
      const forecastDate = new Date(forecastDates[i]);
      const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
      const isToday = forecastDate.toDateString() === today.toDateString();
      
      // Get weather condition and icon based on WMO weather code
      const condition = getWeatherCondition(weatherCodes[i]);
      const icon = getWeatherIconCode(weatherCodes[i], false);
      
      futureDays.push({
        day: dayName,
        condition: condition,
        high: Math.round(maxTemps[i]),
        low: Math.round(minTemps[i]),
        icon: icon,
        isToday: isToday
      });
    }
    
    // Combine past and future days
    return [...pastDays, ...futureDays];
  }, [getWeatherCondition, getWeatherIconCode]);
  
  /**
   * Convert weather icon codes to emoji icons
   * @param iconCode - Weather icon code
   * @returns Emoji representation of weather condition
   */
  const getWeatherIcon = useCallback((iconCode: string) => {
    if (iconCode.includes('01')) return '☀️'; // clear sky
    if (iconCode.includes('02') || iconCode.includes('03')) return '⛅'; // few/scattered clouds
    if (iconCode.includes('04')) return '☁️'; // broken/overcast clouds
    if (iconCode.includes('09') || iconCode.includes('10')) return '🌧️'; // rain
    if (iconCode.includes('11')) return '⛈️'; // thunderstorm
    if (iconCode.includes('13')) return '❄️'; // snow
    if (iconCode.includes('50')) return '🌫️'; // mist/fog
    return '☁️'; // default
  }, []);
  
  /**
   * Convert wind direction degrees to cardinal direction
   * @param degrees - Wind direction in degrees
   * @returns Cardinal direction as string (N, NE, E, etc.)
   */
  const getWindDirection = useCallback((degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }, []);
  
  /**
   * Calculate dew point from temperature and humidity
   * @param temp - Temperature in celsius
   * @param humidity - Relative humidity percentage
   * @returns Dew point in celsius (rounded)
   */
  const calculateDewPoint = useCallback((temp: number, humidity: number): number => {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint);
  }, []);
  
  /**
   * Fetch weather data from Open-Meteo API when city changes
   */
  useEffect(() => {
    // Skip API call if no location is provided
    if (!city) {
      setLoading(false);
      return;
    }
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, get geocoding data to convert city name to coordinates
        const geocodingResponse = await fetch(
          `${GEOCODING_API_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        
        if (!geocodingResponse.ok) {
          throw new Error(`Geocoding API error: ${geocodingResponse.status}`);
        }
        
        const geocodingData = await geocodingResponse.json();
        
        if (!geocodingData.results || geocodingData.results.length === 0) {
          throw new Error(`No location data available for ${city}. Please check the address.`);
        }
        
        const location = geocodingData.results[0];
        const { latitude, longitude, name, country } = location;
        
        // Calculate dates for historical data (past 5 days)
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - 5);
        
        const startDate = pastDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const endDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        // Get historical weather data from Open-Meteo API
        const historicalResponse = await fetch(
          `${HISTORICAL_WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        
        if (!historicalResponse.ok) {
          throw new Error(`Historical weather API error: ${historicalResponse.status}`);
        }
        
        const historicalData = await historicalResponse.json();
        
        // Get current weather and forecast from Open-Meteo API
        const weatherResponse = await fetch(
          `${WEATHER_FORECAST_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`
        );
        
        if (!weatherResponse.ok) {
          throw new Error(`Weather API error: ${weatherResponse.status}`);
        }
        
        const weatherData = await weatherResponse.json();
        
        // Map WMO weather codes to conditions
        const condition = getWeatherCondition(weatherData.current.weather_code);
        const icon = getWeatherIconCode(weatherData.current.weather_code, true);
        
        // Process forecast data with historical data
        const dailyForecasts = processForecastData(weatherData.daily, historicalData.daily);
        
        // Process historical data
        
        // Format data to match our interface
        const formattedData: WeatherData = {
          address: `${name}, ${country}`,
          temperature: Math.round(weatherData.current.temperature_2m),
          condition: condition,
          icon: icon,
          humidity: weatherData.current.relative_humidity_2m,
          windSpeed: weatherData.current.wind_speed_10m,
          windDirection: getWindDirection(weatherData.current.wind_direction_10m),
          pressure: weatherData.current.surface_pressure,
          visibility: weatherData.current.visibility / 1000, // Convert to km
          feelsLike: Math.round(weatherData.current.apparent_temperature),
          dewPoint: calculateDewPoint(weatherData.current.temperature_2m, weatherData.current.relative_humidity_2m),
          forecast: dailyForecasts
        };
        
        setWeatherData(formattedData);
        // Weather data fetched successfully
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [city, processForecastData, getWeatherCondition, getWeatherIconCode, getWindDirection, calculateDewPoint]);



  if (loading) {
    return (
      <div className="project-weather-container">
        <div className="weather-loading">Loading weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-weather-container">
        <div className="weather-error">
          {error.includes('No weather data available') || error.includes('No forecast data available') || error.includes('No location data available')
            ? `No weather data available for your current address or city (${projectLocation})` 
            : error}
        </div>
      </div>
    );
  }
  
  // If no data is available yet
  if (!weatherData || !projectLocation) {
    return (
      <div className="project-weather-container">
        <div className="weather-loading">
          {!projectLocation ? 'Select a project location to view weather data' : 'Waiting for weather data...'}
        </div>
      </div>  
    );
  }

  return (
    <div className="project-weather-container">
      <div className="weather-header">
        <p className="weather-location">{weatherData.address}</p>
      </div>
      
      <div className="weather-content">
        <div className="current-weather">
          <div className="current-temp">
            <span className="temp-value">{weatherData.temperature}°C</span>
            <span className="weather-icon large-icon">
              {getWeatherIcon(weatherData.icon)}
            </span>
          </div>
          <div className="current-condition">{weatherData.condition}</div>
          <div className="feels-like">Feels like {weatherData.feelsLike}°C</div>
        </div>
        

        
        <div className="weather-forecast">
          {weatherData.forecast.map((day, index) => (
            <div 
              key={`forecast-${index}`} 
              className={`forecast-day ${day.isPast ? 'past-day' : ''} ${day.isToday ? 'current-day' : ''}`}
              onClick={() => {
                // Make the day clickable - the click handler is already set up in WeatherTabContent
                // This element will be detected by the event listener in WeatherTabContent
                console.log(`Clicked on forecast day: ${day.day}`);
              }}
              style={{ cursor: 'pointer' }} // Add pointer cursor to indicate clickability
              title={`View detailed forecast for ${day.day}`} // Add tooltip
            >
              <div className="day-name">{day.day}</div>
              <div className="day-icon">{getWeatherIcon(day.icon)}</div>
              <div className="day-temps">
                <span className="high-temp">{day.high}°</span>
                <span className="temp-separator">/</span>
                <span className="low-temp">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectWeatherComponent;
