import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Accommodation_Key {
  id: UUIDString;
  __typename?: 'Accommodation_Key';
}

export interface Activity_Key {
  id: UUIDString;
  __typename?: 'Activity_Key';
}

export interface CreateDemoUserData {
  user_insertMany: User_Key[];
}

export interface CreateNewTripData {
  trip_insert: Trip_Key;
}

export interface CreateNewTripVariables {
  name: string;
  destination: string;
  startDate: DateString;
  endDate: DateString;
  description?: string | null;
}

export interface DeleteTripData {
  trip_delete?: Trip_Key | null;
}

export interface DeleteTripVariables {
  id: UUIDString;
}

export interface ListTripsForUserData {
  trips: ({
    id: UUIDString;
    name: string;
    destination?: string | null;
    startDate: DateString;
    endDate: DateString;
  } & Trip_Key)[];
}

export interface ListTripsForUserVariables {
  ownerId: UUIDString;
}

export interface Transportation_Key {
  id: UUIDString;
  __typename?: 'Transportation_Key';
}

export interface TripCollaborator_Key {
  userId: UUIDString;
  tripId: UUIDString;
  __typename?: 'TripCollaborator_Key';
}

export interface Trip_Key {
  id: UUIDString;
  __typename?: 'Trip_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateDemoUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateDemoUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateDemoUserData, undefined>;
  operationName: string;
}
export const createDemoUserRef: CreateDemoUserRef;

export function createDemoUser(): MutationPromise<CreateDemoUserData, undefined>;
export function createDemoUser(dc: DataConnect): MutationPromise<CreateDemoUserData, undefined>;

interface ListTripsForUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTripsForUserVariables): QueryRef<ListTripsForUserData, ListTripsForUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListTripsForUserVariables): QueryRef<ListTripsForUserData, ListTripsForUserVariables>;
  operationName: string;
}
export const listTripsForUserRef: ListTripsForUserRef;

export function listTripsForUser(vars: ListTripsForUserVariables): QueryPromise<ListTripsForUserData, ListTripsForUserVariables>;
export function listTripsForUser(dc: DataConnect, vars: ListTripsForUserVariables): QueryPromise<ListTripsForUserData, ListTripsForUserVariables>;

interface CreateNewTripRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewTripVariables): MutationRef<CreateNewTripData, CreateNewTripVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewTripVariables): MutationRef<CreateNewTripData, CreateNewTripVariables>;
  operationName: string;
}
export const createNewTripRef: CreateNewTripRef;

export function createNewTrip(vars: CreateNewTripVariables): MutationPromise<CreateNewTripData, CreateNewTripVariables>;
export function createNewTrip(dc: DataConnect, vars: CreateNewTripVariables): MutationPromise<CreateNewTripData, CreateNewTripVariables>;

interface DeleteTripRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTripVariables): MutationRef<DeleteTripData, DeleteTripVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteTripVariables): MutationRef<DeleteTripData, DeleteTripVariables>;
  operationName: string;
}
export const deleteTripRef: DeleteTripRef;

export function deleteTrip(vars: DeleteTripVariables): MutationPromise<DeleteTripData, DeleteTripVariables>;
export function deleteTrip(dc: DataConnect, vars: DeleteTripVariables): MutationPromise<DeleteTripData, DeleteTripVariables>;

