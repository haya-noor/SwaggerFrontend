
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "../../src/types/swaggerTypes.ts";
import { IPet } from "../types/petTypes.tsx";

const client = createClient<paths>({ baseUrl: "http://localhost:3020" });

const hardcodedToken = 'hij';  // Hardcoded token

const myInterceptor: Middleware = {
    async onRequest({ request }) {
        console.log('Setting Authorization header');
        request.headers.set("Authorization", `Bearer ${hardcodedToken}`);
        return request;
    },
    async onResponse({ response }) {
        const { body, ...resOptions } = response;
        return new Response(body, { ...resOptions, status: 200 });
    },
};

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
