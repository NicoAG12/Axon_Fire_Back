import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateData = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // parse() validará y también limpiará los campos extra que no estén en el schema
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err: any) => ({
                    path: err.path.join('.'),
                    message: err.message
                }));
                res.status(400).json({ errors });
                return;
            }
            next(error);
        }
    };
};
