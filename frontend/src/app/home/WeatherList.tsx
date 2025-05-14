const defaultWeather = [
  { time: '10 am', icon: { type: 'cloud' as const }, temperature: '16°' },
  { time: '11 am', icon: { type: 'rain' as const }, temperature: '17°' },
  { time: '12 pm', icon: { type: 'sun' as const }, temperature: '18°' },
  { time: '01 pm', icon: { type: 'cloud' as const }, temperature: '19°' },
];

const WeatherList = () => {
  // 여기서 날씨 정보 가져오면 될 듯해용
  return (
    <section className="mb-2 w-full ">
      <p className="text-2xl font-semibold mb-2">현재 날씨</p>
      <div className="grid grid-cols-4 gap-6">
        {defaultWeather.map((weather, idx) => (
          <WeatherCard key={idx} {...weather} />
        ))}
      </div>
    </section>
  );
};

export default WeatherList;

interface WeatherCardProps {
  time: string;
  icon: {
    type: 'rain' | 'cloud' | 'sun' | 'snow';
  };
  temperature: string;
}

const iconMap = {
  rain: '🌧️',
  cloud: '☁️',
  sun: '☀️',
  snow: '❄️',
};

const WeatherCard = ({ time, icon, temperature }: WeatherCardProps) => {
  return (
    <div className="flex flex-col justify-evenly font-semibold items-center rounded-lg shadow p-2 w-full h-[100px] bg-[#F6F6F6] text-gray-500">
      <div className="text-xs">{time}</div>
      <div className="text-2xl">{iconMap[icon.type]}</div>
      <div className="">{temperature}</div>
    </div>
  );
};
