export interface DailyWeather {
  date: string;
  fullDate: Date;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export const getWeatherForecast = async (
  destination: string,
): Promise<DailyWeather[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Stormy"];
  const today = new Date();
  const forecast: DailyWeather[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    let tempMax = 28 + Math.floor(Math.random() * 8) - 4; // 24-32
    let tempMin = tempMax - (5 + Math.floor(Math.random() * 5)); // 5-10 diff

    // Adjust temp based on condition roughly
    if (condition === "Rainy" || condition === "Stormy") {
      tempMax -= 3;
      tempMin -= 2;
    }

    forecast.push({
      date: date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
      }),
      fullDate: date,
      tempMax,
      tempMin,
      condition,
      icon: getIconForCondition(condition),
      humidity: 60 + Math.floor(Math.random() * 30),
      windSpeed: 5 + Math.floor(Math.random() * 15),
    });
  }

  return forecast;
};

const getIconForCondition = (condition: string) => {
  // Map condition to Lucide icon names (handled in the component)
  return condition;
};
