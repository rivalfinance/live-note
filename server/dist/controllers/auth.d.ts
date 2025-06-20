import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        _id: string;
    };
}
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const getMe: (req: AuthRequest, res: Response) => Promise<void>;
export declare const logout: (req: Request, res: Response) => Promise<void>;
export {};
