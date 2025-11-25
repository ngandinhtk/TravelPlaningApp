import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'my-first-app',
  location: 'us-east4'
};

export const createDemoUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDemoUser');
}
createDemoUserRef.operationName = 'CreateDemoUser';

export function createDemoUser(dc) {
  return executeMutation(createDemoUserRef(dc));
}

export const listTripsForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTripsForUser', inputVars);
}
listTripsForUserRef.operationName = 'ListTripsForUser';

export function listTripsForUser(dcOrVars, vars) {
  return executeQuery(listTripsForUserRef(dcOrVars, vars));
}

export const createNewTripRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewTrip', inputVars);
}
createNewTripRef.operationName = 'CreateNewTrip';

export function createNewTrip(dcOrVars, vars) {
  return executeMutation(createNewTripRef(dcOrVars, vars));
}

export const deleteTripRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTrip', inputVars);
}
deleteTripRef.operationName = 'DeleteTrip';

export function deleteTrip(dcOrVars, vars) {
  return executeMutation(deleteTripRef(dcOrVars, vars));
}

