import fetch from 'node-fetch';

type FetchInterceptor = (url: string, options: RequestInit) => void;

const createFetchWithInterceptors = (interceptors: {
  request?: FetchInterceptor[];
  response?: FetchInterceptor[];
}) => {
  return async (url: string, options: RequestInit) => {
    if (interceptors.request) {
      interceptors.request.forEach(interceptor => interceptor(url, options));
    }

    const response = await fetch(url, options);

    if (interceptors.response) {
      interceptors.response.forEach(interceptor => interceptor(url, options));
    }

    return response;
  };
};

const logRequestInterceptor: FetchInterceptor = (url, options) => {
  console.log(`Request to ${url} with options:`, options);
};

const logResponseInterceptor: FetchInterceptor = (url, options) => {
  console.log(`Response from ${url} with options:`, options);
};

const customFetch = createFetchWithInterceptors({
  request: [logRequestInterceptor],
  response: [logResponseInterceptor],
});
