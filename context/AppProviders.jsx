import { IntelligenceProvider } from "./IntelligenceContext";
// Import other providers here in the future, e.g., UserProvider, TripProvider

/**
 * A wrapper component for all application-wide context providers.
 * This helps keep the root layout clean.
 */
export const AppProviders = ({ children }) => {
  return (
    <IntelligenceProvider>
      {/* <UserProvider>
        <TripProvider> */}
      {children}
      {/* </TripProvider>
      </UserProvider> */}
    </IntelligenceProvider>
  );
};
