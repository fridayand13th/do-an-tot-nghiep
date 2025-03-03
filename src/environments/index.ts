import * as dotenv from "dotenv";
dotenv.config();

// const NEED_TO_CONFIGURED = 'NEED TO CONFIGURED';

// environment
const NODE_ENV: string = process.env.NODE_ENV || "dev";

// application
const SERVER_PORT: number = +process.env.SERVER_PORT || 3000;

export { NODE_ENV, SERVER_PORT };
