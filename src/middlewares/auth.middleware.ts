import { Request, Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';


export interface AuthRequest extends Request {
    user?: string | jsonwebtoken.JwtPayload;
}

export const verificarHeaders = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'No existe autorizacion' });
    }

    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalido o expirado' });
    }
};