import { AuthProvider } from '../context/UserContext';

export default function AppProvider({ children }) {
  return (
    <AuthProvider>
      {/* Add more providers here later */}
      {children}
    </AuthProvider>
  );
}