const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'my-first-app',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createDemoUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDemoUser');
}
createDemoUserRef.operationName = 'CreateDemoUser';
exports.createDemoUserRef = createDemoUserRef;

exports.createDemoUser = function createDemoUser(dc) {
  return executeMutation(createDemoUserRef(dc));
};

const listTripsForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTripsForUser', inputVars);
}
listTripsForUserRef.operationName = 'ListTripsForUser';
exports.listTripsForUserRef = listTripsForUserRef;

exports.listTripsForUser = function listTripsForUser(dcOrVars, vars) {
  return executeQuery(listTripsForUserRef(dcOrVars, vars));
};

const createNewTripRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewTrip', inputVars);
}
createNewTripRef.operationName = 'CreateNewTrip';
exports.createNewTripRef = createNewTripRef;

exports.createNewTrip = function createNewTrip(dcOrVars, vars) {
  return executeMutation(createNewTripRef(dcOrVars, vars));
};

const deleteTripRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTrip', inputVars);
}
deleteTripRef.operationName = 'DeleteTrip';
exports.deleteTripRef = deleteTripRef;

exports.deleteTrip = function deleteTrip(dcOrVars, vars) {
  return executeMutation(deleteTripRef(dcOrVars, vars));
};
