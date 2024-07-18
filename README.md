### Typesafe Client Generator

#### Project Overview
This project ensures type safety between the frontend and backend by fetching the OpenAPI schema from Google Drive, converting it to TypeScript using `openapi-typescript`, and creating route functions for API requests with `openapi-fetch`. It ensures the correct schema is fetched based on the current branch and hash, reducing unnecessary fetches and uploads.

#### Table of Contents
1. [Installation](#installation)
2. [Usage](#usage)
3. [Schema Fetch Process](#schema-fetch-process)
4. [Branch-specific Schema Handling](#branch-specific-schema-handling)
5. [Schema Hashing](#schema-hashing)
6. [Interceptors](#interceptors)

## Installation
### Clone the repository:
```bash
git clone https://github.com/haya-noor/SwaggerFrontend.git
cd example-app-openapi-fetch
```
### Install the dependencies:
```bash
npm install
```

## Usage
1. Create route functions to interact with the backend API.
2. Fetch the schema from Google Drive and convert it to TypeScript interfaces:
    ```bash
    npm run fetch-swagger
    ```
3. Start the client:
    ```bash
    npm run dev
    ```
4. Build the code:
    ```bash
    npm run build
    ```

## Schema Fetch Process
The `fetchSwagger.ts` script is responsible for fetching the `schema.json` from Google Drive. This script is executed before every commit or build using Husky.

### Step-by-Step Process:
1. **Fetch Schema from Google Drive**: Fetch the `schema.json` from Google Drive during commit or build using Husky.
2. **Convert to TypeScript**: Convert the fetched schema to a TypeScript file using `openapi-typescript`.
3. **Build and Type Check**: Rebuild the code and check for type errors.

## Branch-specific Schema Handling
To ensure that the frontend stays in sync with backend changes specific to each branch, it is crucial to fetch the correct schema corresponding to the branch.

### Step-by-Step Process:
1. **Specify Branch in Schema Fetch**: Include the branch name when fetching the schema file from Google Drive.
2. **Update Local Schema**: Save the fetched schema locally for use during development.

## Schema Hashing
To optimize the process and reduce unnecessary operations, a hash is attached to each schema file name. This ensures that the schema is only fetched or uploaded when there are actual changes.

### Step-by-Step Process:
1. **Fetch Remote Hash**: Retrieve the schema file name from Google Drive and extract the hash.
2. **Compare Hashes**: Compare the local hash with the remote hash.
3. **Fetch Schema**: Fetch the schema only if the hashes are different.

## Interceptors
Interceptors allow you to manipulate requests and responses globally. They are useful for adding authentication tokens, logging, error handling, and more.

### Step-by-Step Process:
1. **Create Interceptors**: Use the custom middleware setting of `openapi-fetch` to create interceptors.
2. **Authorization Token**: Add an authorization token to every request to ensure all API requests are authenticated.

