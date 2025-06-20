import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: {
        _id: string;
    };
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => void;
export {};
