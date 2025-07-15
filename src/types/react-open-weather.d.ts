declare module 'react-open-weather' {
  export interface WeatherData {
    name: string;
    current: {
      description: string;
      icon: string;
      temperature: {
        current: number;
        min: number;
        max: number;
      };
      wind: {
        speed: number;
        deg: number;
      };
      humidity: number;
    };
    forecast: Array<{
      date: number;
      description: string;
      icon: string;
      temperature: {
        min: number;
        max: number;
      };
      wind: {
        speed: number;
        deg: number;
      };
      humidity: number;
    }>;
  }

  export interface OpenWeatherOptions {
    key: string;
    lat?: string;
    lon?: string;
    city?: string;
    lang?: string;
    unit?: 'metric' | 'imperial' | 'standard';
  }

  export interface ReactWeatherProps {
    data: WeatherData;
    lang?: string;
    locationLabel?: string;
    unitsLabels?: {
      temperature: string;
      windSpeed: string;
    };
    showForecast?: boolean;
    theme?: any;
    isLoading?: boolean;
    errorMessage?: string | null;
  }

  export function useOpenWeather(options: OpenWeatherOptions): {
    data: WeatherData;
    isLoading: boolean;
    errorMessage: string | null;
  };

  export function useWeatherBit(options: any): {
    data: WeatherData;
    isLoading: boolean;
    errorMessage: string | null;
  };

  export function useVisualCrossing(options: any): {
    data: WeatherData;
    isLoading: boolean;
    errorMessage: string | null;
  };

  const ReactWeather: React.FC<ReactWeatherProps>;
  export default ReactWeather;
}
