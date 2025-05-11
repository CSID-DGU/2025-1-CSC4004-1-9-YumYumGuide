import ScheduleList from './ScheduleList';
import EventList from './EventList';
import WeatherList from './WeatherList';

const HomePage = () => {
  return (
    <div className="w-full px-5 flex flex-col gap-6 min-h-screen pt-20 ">
      <WeatherList />
      <ScheduleList />
      <EventList />
      {/* 편의점 정보도 별도 컴포넌트로 분리 권장, 예시로 남겨둠 */}
    </div>
  );
};

export default HomePage;
