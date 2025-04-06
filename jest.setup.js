// Import custom matchers from @testing-library/jest-dom
import '@testing-library/jest-dom';

import fetch, { Request, Response, Headers } from 'node-fetch';

global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;