export const MOCK_TRIPS = [
  {
    id: '1',
    destination: 'Paris, France',
    status: 'Upcoming',
    dates: '2024-09-10 to 2024-09-17',
    travelers: 2,
    budget: 2500,
    days: 7,
  },
  {
    id: '2',
    destination: 'Kyoto, Japan',
    status: 'Completed',
    dates: '2023-04-05 to 2023-04-15',
    travelers: 1,
    budget: 3000,
    days: 10,
  },
  {
    id: '3',
    destination: 'Sydney, Australia',
    status: 'Completed',
    dates: '2022-12-20 to 2023-01-03',
    travelers: 4,
    budget: 7000,
    days: 14,
  },
];

export const MOCK_USER = {
  uid: 'mock-user-id',
  name: 'Wanderer',
//   avatar: '🧑‍🚀',
  displayName: 'Wanderer',
  avatar: require('../lib/character.jpg'),
};