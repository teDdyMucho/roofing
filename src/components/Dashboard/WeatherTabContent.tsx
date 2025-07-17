import React, { useState, useEffect, useCallback } from 'react';
import ProjectWeatherComponent from './ProjectWeatherComponent';
import { Project } from '../../services/projectService';
import '../../styles/WeatherTabContent.css';

// Weather forecast data interfaces
interface DailyForecastDetails {
  date: string;
  day: string;
  weatherCode: number;
  condition: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

interface WeatherTabContentProps {
  projectLocation?: string;
  projects?: Project[];
}

const WeatherTabContent: React.FC<WeatherTabContentProps> = ({ 
  projectLocation,
  projects = []
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(projectLocation);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [detailedForecast, setDetailedForecast] = useState<DailyForecastDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Helper function to convert WMO weather code to condition
  const getWeatherCondition = (code: number): string => {
    if (code === 0) return 'Clear sky';
    if (code === 1) return 'Mainly clear';
    if (code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code >= 45 && code <= 48) return 'Fog';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 56 && code <= 57) return 'Freezing drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 66 && code <= 67) return 'Freezing rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code >= 85 && code <= 86) return 'Snow showers';
    if (code === 95) return 'Thunderstorm';
    if (code >= 96 && code <= 99) return 'Thunderstorm with hail';
    return 'Unknown';
  };
  
  // Helper function to convert wind direction degrees to cardinal direction
  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };
  
  // Helper function to format time from ISO string
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Function to get weather icon based on weather code
  const getWeatherIcon = (code: number): string => {
    if (code === 0) return '☀️';
    if (code === 1) return '🌤️';
    if (code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 55) return '🌦️';
    if (code >= 56 && code <= 57) return '🌧️';
    if (code >= 61 && code <= 65) return '🌧️';
    if (code >= 66 && code <= 67) return '❄️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '☁️';
  };

  // Function to fetch detailed forecast for a specific day and location
  const fetchDetailedForecast = useCallback(async (day: string, location: string | undefined) => {
    if (!location) {
      console.error('No location provided to fetchDetailedForecast');
      return;
    }
    
    setLoading(true);
    
    try {
      // Get coordinates from the location
      const city = location.split(',')[0];
      const geocodingResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      
      if (!geocodingResponse.ok) {
        throw new Error('Failed to get location coordinates');
      }
      
      const geocodingData = await geocodingResponse.json();
      
      if (!geocodingData.results || geocodingData.results.length === 0) {
        throw new Error('Location not found');
      }
      
      const { latitude, longitude } = geocodingData.results[0];
      
      // Get detailed forecast for the selected day
      const today = new Date();
      const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day);
      let targetDate;
      
      // Check if the selected day is today
      const todayName = today.toLocaleDateString('en-US', { weekday: 'short' });
      if (day === todayName) {
        // If it's today, use today's date
        targetDate = new Date(today);
      } else {
        // Otherwise calculate the target date based on the day name
        targetDate = new Date(today);
        const currentDay = today.getDay();
        let daysToAdd = dayIndex - currentDay;
        
        // If the day is in the past (this week), calculate correctly
        if (daysToAdd < 0) {
          // Check if we're looking at past days (within the last 5 days)
          const pastDaysNames = [];
          for (let i = 1; i <= 5; i++) {
            const pastDate = new Date(today);
            pastDate.setDate(today.getDate() - i);
            pastDaysNames.push(pastDate.toLocaleDateString('en-US', { weekday: 'short' }));
          }
          
          if (pastDaysNames.includes(day)) {
            // It's a past day within the last 5 days
            const pastDayIndex = pastDaysNames.indexOf(day);
            targetDate.setDate(today.getDate() - (pastDayIndex + 1));
          } else {
            // It's next week
            daysToAdd += 7;
            targetDate.setDate(today.getDate() + daysToAdd);
          }
        } else {
          // It's later this week
          targetDate.setDate(today.getDate() + daysToAdd);
        }
      }
      
      const formattedDate = targetDate.toISOString().split('T')[0];
      
      // Fetch detailed weather data for the specific day
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max,wind_speed_10m_max,wind_direction_10m_dominant&current=relative_humidity_2m&timezone=auto&start_date=${formattedDate}&end_date=${formattedDate}`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const weatherData = await weatherResponse.json();
      
      // Convert WMO weather code to condition
      const weatherCode = weatherData.daily.weather_code[0];
      const condition = getWeatherCondition(weatherCode);
      
      // Format the detailed forecast data
      const details: DailyForecastDetails = {
        date: formattedDate,
        day: day,
        weatherCode: weatherCode,
        condition: condition,
        maxTemp: Math.round(weatherData.daily.temperature_2m_max[0]),
        minTemp: Math.round(weatherData.daily.temperature_2m_min[0]),
        precipitation: weatherData.daily.precipitation_sum[0],
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.daily.wind_speed_10m_max[0],
        windDirection: getWindDirection(weatherData.daily.wind_direction_10m_dominant[0]),
        uvIndex: Math.round(weatherData.daily.uv_index_max[0]),
        sunrise: formatTime(weatherData.daily.sunrise[0]),
        sunset: formatTime(weatherData.daily.sunset[0])
      };
      
      setDetailedForecast(details);
    } catch (error) {
      console.error('Error fetching detailed forecast:', error);
      setDetailedForecast(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Function to handle day selection for detailed forecast
  const handleDaySelect = useCallback((day: string) => {
    if (selectedDay === day) {
      // Toggle off if already selected
      setSelectedDay(null);
      setDetailedForecast(null);
      return;
    }
    
    console.log(`Selected day: ${day}`);
    setSelectedDay(day);
    fetchDetailedForecast(day, selectedLocation);
  }, [selectedDay, selectedLocation, fetchDetailedForecast]);
  
  // Function to handle location selection for weather display
  const handleLocationSelect = useCallback((address: string | undefined) => {
    // Clear any existing forecast data first to avoid stale data
    setDetailedForecast(null);
    
    // Get today's day name
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
    
    console.log(`Selecting today's weather (${dayName}) for location: ${address}`);
    
    // Important: Set the location first, then immediately fetch the forecast
    // without relying on the state update
    setSelectedLocation(address);
    setSelectedDay(dayName);
    
    // Directly fetch the forecast data using the provided address
    if (address) {
      fetchDetailedForecast(dayName, address);
    }
  }, [fetchDetailedForecast]);
  
  // Listen for clicks on forecast days in the ProjectWeatherComponent
  useEffect(() => {
    const handleForecastDayClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const forecastDay = target.closest('.forecast-day');
      
      if (forecastDay) {
        // Remove 'selected' class from all forecast days
        document.querySelectorAll('.forecast-day').forEach(day => {
          day.classList.remove('selected');
        });
        
        // Add 'selected' class to the clicked day
        forecastDay.classList.add('selected');
        
        const dayNameElement = forecastDay.querySelector('.day-name');
        if (dayNameElement) {
          const day = dayNameElement.textContent;
          if (day) {
            handleDaySelect(day);
          }
        }
      }
    };
    
    document.addEventListener('click', handleForecastDayClick);
    
    return () => {
      document.removeEventListener('click', handleForecastDayClick);
    };
  }, [handleDaySelect]);
  
  // Add effect to mark the selected day when it changes
  useEffect(() => {
    if (selectedDay) {
      // First remove 'selected' class from all days
      document.querySelectorAll('.forecast-day').forEach(day => {
        day.classList.remove('selected');
      });
      
      // Find the day element that matches the selected day and add the 'selected' class
      document.querySelectorAll('.forecast-day').forEach(day => {
        const dayNameElement = day.querySelector('.day-name');
        if (dayNameElement && dayNameElement.textContent === selectedDay) {
          day.classList.add('selected');
        }
      });
    }
  }, [selectedDay]);

  return (
    <div className="weather-tab-content">
      <div className="weather-tab-header">
        <h2>Weather Forecast</h2>
        <p className="weather-subtitle">Real-time weather data for your project locations</p>
      </div>
      
      <div className="weather-content-layout">
        <div className="weather-container">
          <div className="weather-card">
            <ProjectWeatherComponent projectLocation={selectedLocation} />
            
            {selectedDay && (
              <div className="detailed-forecast">
                <h3>Detailed Forecast for {selectedDay}</h3>
                {loading ? (
                  <div className="loading-details">Loading detailed forecast...</div>
                ) : detailedForecast ? (
                  <div className="forecast-details">
                    <div className="forecast-details-header">
                      <div className="forecast-date">{detailedForecast.date}</div>
                      <div className="forecast-condition">
                        <span className="condition-icon">{getWeatherIcon(detailedForecast.weatherCode)}</span>
                        <span>{detailedForecast.condition}</span>
                      </div>
                    </div>
                    
                    <div className="forecast-details-grid">
                      <div className="detail-item">
                        <div className="detail-label">Temperature</div>
                        <div className="detail-value">{detailedForecast.maxTemp}° / {detailedForecast.minTemp}°</div>
                      </div>
                      
                      <div className="detail-item">
                        <div className="detail-label">Precipitation</div>
                        <div className="detail-value">{detailedForecast.precipitation} mm</div>
                      </div>
                      
                      <div className="detail-item">
                        <div className="detail-label">Humidity</div>
                        <div className="detail-value">{detailedForecast.humidity}%</div>
                      </div>
                      
                      <div className="detail-item">
                        <div className="detail-label">Wind</div>
                        <div className="detail-value">{detailedForecast.windSpeed} km/h {detailedForecast.windDirection}</div>
                      </div>
                      
                      <div className="detail-item">
                        <div className="detail-label">UV Index</div>
                        <div className="detail-value">{detailedForecast.uvIndex}</div>
                      </div>
                      
                      <div className="detail-item">
                        <div className="detail-label">Sunrise</div>
                        <div className="detail-value">{detailedForecast.sunrise}</div>
                      </div>
                      
                      <div className="detail-item">
                        <div className="detail-label">Sunset</div>
                        <div className="detail-value">{detailedForecast.sunset}</div>
                      </div>
                    </div>
                    
                    <div className="forecast-tip">
                      <div className="tip-header">Weather Tip:</div>
                      <div className="tip-content">
                        {detailedForecast.condition.toLowerCase().includes('rain') ? 
                          "Consider rescheduling outdoor roofing work due to precipitation." :
                          detailedForecast.windSpeed > 20 ? 
                          "High winds may affect roofing work safety. Take precautions." :
                          detailedForecast.uvIndex > 7 ? 
                          "High UV index. Ensure workers use sun protection." :
                          "Weather conditions appear suitable for roofing work."}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-details">Unable to load detailed forecast</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="location-selector">
          <div className="location-selector-header">
            <div className="location-header-content">
              <h3>Project Locations</h3>
              <p className="location-help-text">Select a project to view weather data</p>
            </div>
            <div className="location-count">{projects.length}</div>
          </div>
          
          {projects.length > 0 ? (
            <div className="location-list">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className={`location-item ${project.address === selectedLocation ? 'active' : ''}`}
                  onClick={() => handleLocationSelect(project.address)}
                  title={`View weather for ${project.client} at ${project.address}`}
                >
                  <div className="location-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="location-details">
                    <div className="location-name">{project.client}</div>
                    <div className="location-address">{project.address}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-locations">
              <div className="no-data-icon"><i className="fas fa-map-signs"></i></div>
              <p>No project locations available</p>
              <p className="no-data-help">Projects will appear here when created</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherTabContent;