import ScheduleList from './ScheduleList';
import EventList from './EventList';
import WeatherList from './WeatherList';
import StoreList from './StoreList';

const HomePage = () => {
  return (
    <div className="w-full px-5 flex flex-col gap-6 min-h-screen pt-20 pb-20">
      <WeatherList />
      <ScheduleList />
      <EventList />
      <StoreList />
    </div>
  );
};

export default HomePage;
