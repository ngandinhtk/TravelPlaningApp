import { CreateDemoUserData, ListTripsForUserData, ListTripsForUserVariables, CreateNewTripData, CreateNewTripVariables, DeleteTripData, DeleteTripVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateDemoUser(options?: useDataConnectMutationOptions<CreateDemoUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateDemoUserData, undefined>;
export function useCreateDemoUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateDemoUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateDemoUserData, undefined>;

export function useListTripsForUser(vars: ListTripsForUserVariables, options?: useDataConnectQueryOptions<ListTripsForUserData>): UseDataConnectQueryResult<ListTripsForUserData, ListTripsForUserVariables>;
export function useListTripsForUser(dc: DataConnect, vars: ListTripsForUserVariables, options?: useDataConnectQueryOptions<ListTripsForUserData>): UseDataConnectQueryResult<ListTripsForUserData, ListTripsForUserVariables>;

export function useCreateNewTrip(options?: useDataConnectMutationOptions<CreateNewTripData, FirebaseError, CreateNewTripVariables>): UseDataConnectMutationResult<CreateNewTripData, CreateNewTripVariables>;
export function useCreateNewTrip(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewTripData, FirebaseError, CreateNewTripVariables>): UseDataConnectMutationResult<CreateNewTripData, CreateNewTripVariables>;

export function useDeleteTrip(options?: useDataConnectMutationOptions<DeleteTripData, FirebaseError, DeleteTripVariables>): UseDataConnectMutationResult<DeleteTripData, DeleteTripVariables>;
export function useDeleteTrip(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteTripData, FirebaseError, DeleteTripVariables>): UseDataConnectMutationResult<DeleteTripData, DeleteTripVariables>;
