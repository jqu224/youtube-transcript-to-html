import {bootstrapAppClient} from './app-client-runtime.js';

export const CLIENT_APP_SOURCE = `
const __name = (target) => target;
(${bootstrapAppClient.toString()})();
`;
