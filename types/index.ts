export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Trip {
  id: string;
  destination: string;
  dates: string;
  travelers: number;
  budget: number;
  days: number;
  status: string;
}