/*
import {IPet} from "../types/petTypes.tsx";

export const getPets = async () => {
    try {
        const petsList: unknown = (await fetch("http://localhost:3020/petsapp/pet")).json();
        if (!petsList) throw new Error("No data found");

        return petsList as IPet[];
    } catch (error) {
        console.log("Cannot Get");
        return [];
    }
};
*/


//using openapi fetch 

import createClient from "openapi-fetch";
import type { paths } from "../../src/types/swaggerTypes.ts";
import { IPet } from "../types/petTypes.tsx";

const client = createClient<paths>({ baseUrl: "http://localhost:3020" });

export const getPets = async (): Promise<IPet[]> => {
    try {
        const { data, error } = await client.GET("/petsapp/pet");

    if (error) {
        console.error("Error fetching pets:", error);
        throw new Error("Cannot Get");
    }

    return data as IPet[];
} catch (error) {
    console.error("Cannot Get");
    return [];
}
};



// using feTS library 
/*
import { createClient, NormalizeOAS } from "fets";
import { IPet } from "../types/petTypes.tsx";
import type openapi from "../output/swagger-h-branch3.ts"; // Adjust this path according to the branch

const client = createClient<NormalizeOAS<typeof openapi>>({endpoint: "/", });

export const getPets = async (): Promise<IPet[]> => {
  try {
    const response = await client["/petsapp/pet"].get();

    if (!response.ok) {
      console.error("Error fetching pets:", response.statusText);
      throw new Error("Cannot Get");
    }

    return response.json(); 
  } catch (error) {
    console.error("Cannot Get", error);
    return [];
  }
};
*/

//using POST
/*
import { IPet } from "../types/petTypes.tsx";
//import type openapi from "../output/swagger-h-branch3.ts"; 

const API_ENDPOINT = "http://localhost:3020"; // Replace with your actual endpoint

export const getPets = async (): Promise<IPet[]> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/petsapp/pet`, {
      method: "GET", // Change this to POST if the API expects a POST request
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Error fetching pets:", response.statusText);
      throw new Error("Cannot Get");
    }

    const data = await response.json();
    return data as IPet[];
  } catch (error) {
    console.error("Cannot Get", error);
    return [];
  }
};
*/