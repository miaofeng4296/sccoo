'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, CloudLightning, CloudFog, Wind } from 'lucide-react';

interface WeatherData {
  temp: number;
  code: number;
  city: string;
}

// WMO weather codes mapping
function getWeatherInfo(code: number): { icon: React.ReactNode; text: string } {
  if (code <= 0) return { icon: <Sun className="h-4 w-4 text-orange-500" />, text: '晴天' };
  if (code <= 3) return { icon: <Cloud className="h-4 w-4 text-gray-500" />, text: '多云' };
  if (code <= 10) return { icon: <CloudFog className="h-4 w-4 text-gray-400" />, text: '雾' };
  if (code <= 19) return { icon: <Cloud className="h-4 w-4 text-gray-400" />, text: '阴天' };
  if (code <= 29) return { icon: <CloudRain className="h-4 w-4 text-blue-500" />, text: '阵雨' };
  if (code <= 39) return { icon: <CloudSnow className="h-4 w-4 text-blue-300" />, text: '雪' };
  if (code <= 49) return { icon: <CloudFog className="h-4 w-4 text-gray-400" />, text: '雾' };
  if (code <= 59) return { icon: <CloudRain className="h-4 w-4 text-blue-400" />, text: '小雨' };
  if (code <= 69) return { icon: <CloudRain className="h-4 w-4 text-blue-600" />, text: '中雨' };
  if (code <= 79) return { icon: <CloudSnow className="h-4 w-4 text-blue-400" />, text: '雪' };
  if (code <= 84) return { icon: <CloudRain className="h-4 w-4 text-blue-500" />, text: '阵雨' };
  if (code <= 94) return { icon: <CloudSnow className="h-4 w-4 text-blue-300" />, text: '雪' };
  return { icon: <CloudLightning className="h-4 w-4 text-yellow-500" />, text: '雷暴' };
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Try IP geolocation first
        let lat = 39.9042;
        let lon = 116.4074;
        let cityName = '北京';

        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
              lat = ipData.latitude;
              lon = ipData.longitude;
              cityName = ipData.city || '北京';
            }
          }
        } catch {
          // Use default Beijing coordinates
        }

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia/Shanghai`
        );
        if (res.ok) {
          const data = await res.json();
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
            city: cityName,
          });
        }
      } catch {
        // Silent fail - weather is non-critical
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return <span className="text-gray-400">天气加载中...</span>;
  }

  if (!weather) {
    return null;
  }

  const info = getWeatherInfo(weather.code);

  return (
    <span className="flex items-center gap-1">
      {info.icon}
      <span>{weather.city}</span>
      <span className="font-medium">{weather.temp}°C</span>
      <span>{info.text}</span>
    </span>
  );
}
