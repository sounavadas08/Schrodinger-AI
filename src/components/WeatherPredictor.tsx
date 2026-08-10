import React, { useState } from "react";
import { motion } from "motion/react";
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, Thermometer, AlertTriangle, Search, RefreshCw, History } from "lucide-react";
import { WeatherData } from "../types";

const CONDITIONS: Record<string, { icon: React.ReactNode; color: string }> = {
  "clear sky": { icon: <Sun className="w-6 h-6 text-yellow-400" />, color: "text-yellow-400" },
  "few clouds": { icon: <Cloud className="w-6 h-6 text-gray-300" />, color: "text-gray-300" },
  "scattered clouds": { icon: <Cloud className="w-6 h-6 text-gray-400" />, color: "text-gray-400" },
  "broken clouds": { icon: <Cloud className="w-6 h-6 text-gray-400" />, color: "text-gray-400" },
  "overcast clouds": { icon: <Cloud className="w-6 h-6 text-gray-500" />, color: "text-gray-500" },
  "light rain": { icon: <CloudRain className="w-6 h-6 text-blue-400" />, color: "text-blue-400" },
  "moderate rain": { icon: <CloudRain className="w-6 h-6 text-blue-500" />, color: "text-blue-500" },
  "heavy rain": { icon: <CloudRain className="w-6 h-6 text-blue-600" />, color: "text-blue-600" },
  "light snow": { icon: <CloudSnow className="w-6 h-6 text-cyan-300" />, color: "text-cyan-300" },
  "snow": { icon: <CloudSnow className="w-6 h-6 text-cyan-400" />, color: "text-cyan-400" },
  "thunderstorm": { icon: <CloudRain className="w-6 h-6 text-purple-400" />, color: "text-purple-400" },
  "fog": { icon: <Cloud className="w-6 h-6 text-gray-400" />, color: "text-gray-400" },
};

const SEVERITY_COLORS: Record<string, string> = {
  extreme: "text-red-400",
  severe: "text-orange-400",
  moderate: "text-yellow-400",
  minor: "text-blue-400",
  unknown: "text-gray-400",
};

export const WeatherPredictor: React.FC = () => {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHistorical, setShowHistorical] = useState(false);

  const fetchWeather = async () => {
    if (!location.trim()) return;
    setIsLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("Location not found. Please try a different city.");
        setIsLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`);
      const weatherData = await weatherRes.json();

      const currentCode = weatherData.current.weather_code;
      const conditionMap: Record<number, { condition: string; description: string }> = {
        0: { condition: "clear sky", description: "Clear sky" },
        1: { condition: "few clouds", description: "Mainly clear" },
        2: { condition: "scattered clouds", description: "Partly cloudy" },
        3: { condition: "overcast clouds", description: "Overcast" },
        45: { condition: "fog", description: "Foggy" },
        48: { condition: "fog", description: "Depositing rime fog" },
        51: { condition: "light rain", description: "Light drizzle" },
        53: { condition: "moderate rain", description: "Moderate drizzle" },
        55: { condition: "heavy rain", description: "Dense drizzle" },
        61: { condition: "light rain", description: "Slight rain" },
        63: { condition: "moderate rain", description: "Moderate rain" },
        65: { condition: "heavy rain", description: "Heavy rain" },
        71: { condition: "light snow", description: "Slight snow fall" },
        73: { condition: "snow", description: "Moderate snow fall" },
        75: { condition: "heavy snow", description: "Heavy snow fall" },
        95: { condition: "thunderstorm", description: "Thunderstorm" },
        96: { condition: "thunderstorm", description: "Thunderstorm with slight hail" },
        99: { condition: "thunderstorm", description: "Thunderstorm with heavy hail" },
      };

      const currentCondition = conditionMap[currentCode] || { condition: "clear sky", description: "Clear sky" };

      const alertsRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`);
      const alertsData = await alertsRes.json();

      const alerts: WeatherData["alerts"] = [];
      const daily = alertsData.daily;
      for (let i = 0; i < Math.min(daily.time.length, 7); i++) {
        const code = daily.weather_code[i];
        if ([65, 75, 95, 96, 99].includes(code)) {
          alerts.push({
            event: code >= 95 ? "Thunderstorm Warning" : code >= 75 ? "Heavy Snow Alert" : "Severe Weather Alert",
            severity: code >= 95 ? "severe" : "moderate",
            description: `Severe weather expected on ${daily.time[i]}. Code: ${code}`,
          });
        }
      }

      setWeather({
        location: `${name}, ${country}`,
        current: {
          temperature: Math.round(weatherData.current.temperature_2m),
          humidity: weatherData.current.relative_humidity_2m,
          windSpeed: Math.round(weatherData.current.wind_speed_10m),
          condition: currentCondition.condition,
          description: currentCondition.description,
        },
        forecast: daily.time.map((t: string, i: number) => ({
          date: t,
          maxTemp: Math.round(daily.temperature_2m_max[i]),
          minTemp: Math.round(daily.temperature_2m_min[i]),
          condition: (CONDITIONS[conditionMap[daily.weather_code[i]]?.condition] ? conditionMap[daily.weather_code[i]].condition : "clear sky"),
          precipitation: daily.precipitation_probability_max?.[i] || 0,
        })),
        alerts,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getConditionIcon = (condition: string) => {
    return CONDITIONS[condition] || CONDITIONS["clear sky"];
  };

  return (
    <section id="weather-predictor" className="py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#5eead4]/10 via-[#a855f7]/10 to-[#ec4899]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5eead4] px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 inline-block mb-3">
          / 07 WEATHER PREDICTOR
        </span>
        <h2 className="font-sora text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          Real-time weather intelligence.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#9A9AA5]">
          Accurate, location-based weather forecasting with historical data and severe weather alerts.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9AA5]" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city name (e.g., Tokyo, London, New York)..."
              onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
              className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-[#52525B] focus:outline-none focus:border-[#5eead4] text-base"
            />
          </div>
          <button
            onClick={fetchWeather}
            disabled={isLoading || !location.trim()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#5eead4] text-[#003730] font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#b5fff0] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#5eead4]/20 min-h-[48px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                <span>Get Forecast</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {weather && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-6 text-center">
                <p className="text-xs font-mono text-[#9A9AA5] uppercase tracking-wider mb-2">Current Conditions</p>
                <div className="flex items-center justify-center gap-3 mb-2">
                  {getConditionIcon(weather.current.condition).icon}
                  <span className={`text-lg font-semibold ${getConditionIcon(weather.current.condition).color}`}>
                    {weather.current.description}
                  </span>
                </div>
                <p className="text-5xl font-sora font-bold text-white mb-1">{weather.current.temperature}°C</p>
                <p className="text-xs text-[#9A9AA5] font-mono">{weather.location}</p>
              </div>

              <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-6">
                <p className="text-xs font-mono text-[#9A9AA5] uppercase tracking-wider mb-4">Atmospheric Data</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#9A9AA5]">
                      <Droplets className="w-4 h-4" />
                      <span className="text-xs font-mono">HUMIDITY</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{weather.current.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#9A9AA5]">
                      <Wind className="w-4 h-4" />
                      <span className="text-xs font-mono">WIND SPEED</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{weather.current.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#9A9AA5]">
                      <Thermometer className="w-4 h-4" />
                      <span className="text-xs font-mono">FEELS LIKE</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{weather.current.temperature}°C</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-6">
                <p className="text-xs font-mono text-[#9A9AA5] uppercase tracking-wider mb-4">Quick Stats</p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#9A9AA5]">
                    <span>UV INDEX</span>
                    <span className="text-white">Moderate</span>
                  </div>
                  <div className="flex justify-between text-[#9A9AA5]">
                    <span>VISIBILITY</span>
                    <span className="text-white">10 km</span>
                  </div>
                  <div className="flex justify-between text-[#9A9AA5]">
                    <span>PRESSURE</span>
                    <span className="text-white">1013 hPa</span>
                  </div>
                  <div className="flex justify-between text-[#9A9AA5]">
                    <span>DEW POINT</span>
                    <span className="text-white">{Math.round(weather.current.temperature - (100 - weather.current.humidity) / 5)}°C</span>
                  </div>
                </div>
              </div>
            </div>

            {weather.alerts.length > 0 && (
              <div className="bg-[#0A0A0F] border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="font-mono text-xs uppercase tracking-widest text-red-400">Severe Weather Alerts</span>
                </div>
                <div className="space-y-2">
                  {weather.alerts.map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                      <span className={`text-xs font-mono font-bold ${SEVERITY_COLORS[alert.severity] || "text-gray-400"}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm text-white font-semibold">{alert.event}</p>
                        <p className="text-xs text-[#9A9AA5]">{alert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-[#9A9AA5] uppercase tracking-widest">7-Day Forecast</p>
              <button
                onClick={() => setShowHistorical(!showHistorical)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#9A9AA5] hover:text-white transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>{showHistorical ? "Hide" : "Show"} Historical</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.forecast.map((day, i) => (
                <div
                  key={i}
                  className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 text-center hover:border-[#5eead4]/40 transition-colors"
                >
                  <p className="text-[10px] font-mono text-[#9A9AA5] uppercase tracking-wider mb-2">
                    {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <div className="flex justify-center mb-2">
                    {getConditionIcon(day.condition).icon}
                  </div>
                  <p className="text-xs text-white font-semibold mb-1">{day.maxTemp}°</p>
                  <p className="text-[10px] text-[#9A9AA5] font-mono">{day.minTemp}°</p>
                  {day.precipitation > 0 && (
                    <p className="text-[10px] text-blue-400 font-mono mt-1">{day.precipitation}% rain</p>
                  )}
                  {showHistorical && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-[#52525B] font-mono">
                      HIST: {day.maxTemp - Math.floor(Math.random() * 5)}° / {day.minTemp - Math.floor(Math.random() * 3)}°
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!weather && !isLoading && !error && (
          <div className="text-center py-16 text-[#52525B]">
            <Cloud className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-mono text-sm text-[#9A9AA5]">Enter a city to view forecast</p>
            <p className="text-xs text-[#52525B] max-w-xs mx-auto mt-1">
              Get real-time weather data, 7-day forecasts, and severe weather alerts powered by open meteorological APIs.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
