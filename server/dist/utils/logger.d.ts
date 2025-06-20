import winston from 'winston';
declare const logger: winston.Logger;
export declare const logRequest: (req: any, res: any, next: any) => void;
export declare const logError: (err: any, req: any, res: any, next: any) => void;
export default logger;
