import { IntelligenceProvider } from "./IntelligenceContext";
import { TripProvider } from "./TripContext";
import { UserProvider } from "./UserContext";

export const AppProviders = ({ children }) => {
  return (
    <UserProvider>
      <TripProvider>
        <IntelligenceProvider>{children}</IntelligenceProvider>
      </TripProvider>
    </UserProvider>
  );
};
