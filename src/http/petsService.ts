

//using openapi fetch 
/*
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
*/


//using openapi middleware 

import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "../../src/types/swaggerTypes.ts";
import { IPet } from "../types/petTypes.tsx";


let accessToken: string | null = null;

const someAuthFunc = async (): Promise<{ accessToken: string | null }> => {
    return { accessToken: 'hijklmn' };
};

const myInterceptor: Middleware = {
    async onRequest({ request, schemaPath }) {
        // Remove the check for "/petsapp/pet/single"
        if (!accessToken) {
            const authRes = await someAuthFunc();
            if (authRes.accessToken) {
                accessToken = authRes.accessToken;
            } else {
                throw new Error("Authentication failed");
            }
        }

        request.headers.set("Authorization", `Bearer ${accessToken}`);
        return request;
    },
    async onResponse({ response }) {
        const { body, ...resOptions } = response;
        return new Response(body, { ...resOptions, status: 200 });
    },
};

const client = createClient<paths>({ baseUrl: "http://localhost:3020" });

client.use(myInterceptor);

export const getPets = async (): Promise<IPet[]> => {
  
    try {
        const { data, error } = await client.GET("/petsapp/pet");

        if (error) {
            console.error("Error fetching pets:", error);
            throw new Error("Cannot Get");
        }

        return data as IPet[];
    } catch (error) {
        console.error("Cannot Get", error);
        return [];
    }
};
