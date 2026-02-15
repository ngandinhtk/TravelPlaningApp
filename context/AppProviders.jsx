import { IntelligenceProvider } from "./IntelligenceContext";
import { TripProvider } from "./TripContext";
import { UserProvider } from "./UserContext";
// Import other providers here in the future

/**
 * A wrapper component for all application-wide context providers.
 * This helps keep the root layout clean.
 */
export const AppProviders = ({ children }) => {
  return (
    <IntelligenceProvider>
      <UserProvider>
        <TripProvider>{children}</TripProvider>
      </UserProvider>
    </IntelligenceProvider>
  );
};
