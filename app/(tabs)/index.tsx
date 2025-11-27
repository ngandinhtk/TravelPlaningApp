import HomeScreen from '../../app/home/home';
import { useUser } from '../../context/UserContext';

export default function Home() {
  const { user } = useUser();
  // The UserProvider is now in the root layout, so we just use the hook here.
  return <HomeScreen user={user} onCreateTrip={() => {}} onViewTrip={() => {}} />;
}