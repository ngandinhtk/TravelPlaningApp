# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListTripsForUser*](#listtripsforuser)
- [**Mutations**](#mutations)
  - [*CreateDemoUser*](#createdemouser)
  - [*CreateNewTrip*](#createnewtrip)
  - [*DeleteTrip*](#deletetrip)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListTripsForUser
You can execute the `ListTripsForUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTripsForUser(vars: ListTripsForUserVariables): QueryPromise<ListTripsForUserData, ListTripsForUserVariables>;

interface ListTripsForUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTripsForUserVariables): QueryRef<ListTripsForUserData, ListTripsForUserVariables>;
}
export const listTripsForUserRef: ListTripsForUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTripsForUser(dc: DataConnect, vars: ListTripsForUserVariables): QueryPromise<ListTripsForUserData, ListTripsForUserVariables>;

interface ListTripsForUserRef {
  ...
  (dc: DataConnect, vars: ListTripsForUserVariables): QueryRef<ListTripsForUserData, ListTripsForUserVariables>;
}
export const listTripsForUserRef: ListTripsForUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTripsForUserRef:
```typescript
const name = listTripsForUserRef.operationName;
console.log(name);
```

### Variables
The `ListTripsForUser` query requires an argument of type `ListTripsForUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListTripsForUserVariables {
  ownerId: UUIDString;
}
```
### Return Type
Recall that executing the `ListTripsForUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTripsForUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListTripsForUserData {
  trips: ({
    id: UUIDString;
    name: string;
    destination?: string | null;
    startDate: DateString;
    endDate: DateString;
  } & Trip_Key)[];
}
```
### Using `ListTripsForUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTripsForUser, ListTripsForUserVariables } from '@dataconnect/generated';

// The `ListTripsForUser` query requires an argument of type `ListTripsForUserVariables`:
const listTripsForUserVars: ListTripsForUserVariables = {
  ownerId: ..., 
};

// Call the `listTripsForUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTripsForUser(listTripsForUserVars);
// Variables can be defined inline as well.
const { data } = await listTripsForUser({ ownerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTripsForUser(dataConnect, listTripsForUserVars);

console.log(data.trips);

// Or, you can use the `Promise` API.
listTripsForUser(listTripsForUserVars).then((response) => {
  const data = response.data;
  console.log(data.trips);
});
```

### Using `ListTripsForUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTripsForUserRef, ListTripsForUserVariables } from '@dataconnect/generated';

// The `ListTripsForUser` query requires an argument of type `ListTripsForUserVariables`:
const listTripsForUserVars: ListTripsForUserVariables = {
  ownerId: ..., 
};

// Call the `listTripsForUserRef()` function to get a reference to the query.
const ref = listTripsForUserRef(listTripsForUserVars);
// Variables can be defined inline as well.
const ref = listTripsForUserRef({ ownerId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTripsForUserRef(dataConnect, listTripsForUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.trips);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.trips);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateDemoUser
You can execute the `CreateDemoUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createDemoUser(): MutationPromise<CreateDemoUserData, undefined>;

interface CreateDemoUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateDemoUserData, undefined>;
}
export const createDemoUserRef: CreateDemoUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDemoUser(dc: DataConnect): MutationPromise<CreateDemoUserData, undefined>;

interface CreateDemoUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateDemoUserData, undefined>;
}
export const createDemoUserRef: CreateDemoUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDemoUserRef:
```typescript
const name = createDemoUserRef.operationName;
console.log(name);
```

### Variables
The `CreateDemoUser` mutation has no variables.
### Return Type
Recall that executing the `CreateDemoUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDemoUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDemoUserData {
  user_insertMany: User_Key[];
}
```
### Using `CreateDemoUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDemoUser } from '@dataconnect/generated';


// Call the `createDemoUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDemoUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDemoUser(dataConnect);

console.log(data.user_insertMany);

// Or, you can use the `Promise` API.
createDemoUser().then((response) => {
  const data = response.data;
  console.log(data.user_insertMany);
});
```

### Using `CreateDemoUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDemoUserRef } from '@dataconnect/generated';


// Call the `createDemoUserRef()` function to get a reference to the mutation.
const ref = createDemoUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDemoUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insertMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insertMany);
});
```

## CreateNewTrip
You can execute the `CreateNewTrip` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewTrip(vars: CreateNewTripVariables): MutationPromise<CreateNewTripData, CreateNewTripVariables>;

interface CreateNewTripRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewTripVariables): MutationRef<CreateNewTripData, CreateNewTripVariables>;
}
export const createNewTripRef: CreateNewTripRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewTrip(dc: DataConnect, vars: CreateNewTripVariables): MutationPromise<CreateNewTripData, CreateNewTripVariables>;

interface CreateNewTripRef {
  ...
  (dc: DataConnect, vars: CreateNewTripVariables): MutationRef<CreateNewTripData, CreateNewTripVariables>;
}
export const createNewTripRef: CreateNewTripRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewTripRef:
```typescript
const name = createNewTripRef.operationName;
console.log(name);
```

### Variables
The `CreateNewTrip` mutation requires an argument of type `CreateNewTripVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewTripVariables {
  name: string;
  destination: string;
  startDate: DateString;
  endDate: DateString;
  description?: string | null;
}
```
### Return Type
Recall that executing the `CreateNewTrip` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewTripData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewTripData {
  trip_insert: Trip_Key;
}
```
### Using `CreateNewTrip`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewTrip, CreateNewTripVariables } from '@dataconnect/generated';

// The `CreateNewTrip` mutation requires an argument of type `CreateNewTripVariables`:
const createNewTripVars: CreateNewTripVariables = {
  name: ..., 
  destination: ..., 
  startDate: ..., 
  endDate: ..., 
  description: ..., // optional
};

// Call the `createNewTrip()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewTrip(createNewTripVars);
// Variables can be defined inline as well.
const { data } = await createNewTrip({ name: ..., destination: ..., startDate: ..., endDate: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewTrip(dataConnect, createNewTripVars);

console.log(data.trip_insert);

// Or, you can use the `Promise` API.
createNewTrip(createNewTripVars).then((response) => {
  const data = response.data;
  console.log(data.trip_insert);
});
```

### Using `CreateNewTrip`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewTripRef, CreateNewTripVariables } from '@dataconnect/generated';

// The `CreateNewTrip` mutation requires an argument of type `CreateNewTripVariables`:
const createNewTripVars: CreateNewTripVariables = {
  name: ..., 
  destination: ..., 
  startDate: ..., 
  endDate: ..., 
  description: ..., // optional
};

// Call the `createNewTripRef()` function to get a reference to the mutation.
const ref = createNewTripRef(createNewTripVars);
// Variables can be defined inline as well.
const ref = createNewTripRef({ name: ..., destination: ..., startDate: ..., endDate: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewTripRef(dataConnect, createNewTripVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.trip_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.trip_insert);
});
```

## DeleteTrip
You can execute the `DeleteTrip` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteTrip(vars: DeleteTripVariables): MutationPromise<DeleteTripData, DeleteTripVariables>;

interface DeleteTripRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTripVariables): MutationRef<DeleteTripData, DeleteTripVariables>;
}
export const deleteTripRef: DeleteTripRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteTrip(dc: DataConnect, vars: DeleteTripVariables): MutationPromise<DeleteTripData, DeleteTripVariables>;

interface DeleteTripRef {
  ...
  (dc: DataConnect, vars: DeleteTripVariables): MutationRef<DeleteTripData, DeleteTripVariables>;
}
export const deleteTripRef: DeleteTripRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteTripRef:
```typescript
const name = deleteTripRef.operationName;
console.log(name);
```

### Variables
The `DeleteTrip` mutation requires an argument of type `DeleteTripVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteTripVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteTrip` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteTripData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteTripData {
  trip_delete?: Trip_Key | null;
}
```
### Using `DeleteTrip`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteTrip, DeleteTripVariables } from '@dataconnect/generated';

// The `DeleteTrip` mutation requires an argument of type `DeleteTripVariables`:
const deleteTripVars: DeleteTripVariables = {
  id: ..., 
};

// Call the `deleteTrip()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteTrip(deleteTripVars);
// Variables can be defined inline as well.
const { data } = await deleteTrip({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteTrip(dataConnect, deleteTripVars);

console.log(data.trip_delete);

// Or, you can use the `Promise` API.
deleteTrip(deleteTripVars).then((response) => {
  const data = response.data;
  console.log(data.trip_delete);
});
```

### Using `DeleteTrip`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteTripRef, DeleteTripVariables } from '@dataconnect/generated';

// The `DeleteTrip` mutation requires an argument of type `DeleteTripVariables`:
const deleteTripVars: DeleteTripVariables = {
  id: ..., 
};

// Call the `deleteTripRef()` function to get a reference to the mutation.
const ref = deleteTripRef(deleteTripVars);
// Variables can be defined inline as well.
const ref = deleteTripRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteTripRef(dataConnect, deleteTripVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.trip_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.trip_delete);
});
```

