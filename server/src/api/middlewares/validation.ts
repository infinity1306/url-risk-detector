import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: (error as any).errors.map((e: any) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};

export const analyzeUrlSchema = z.object({
    url: z
        .string()
        .min(1, 'URL is required')
        .max(2048, 'URL is too long')
        .transform((val) => {
            let normalized = val.trim();
            if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
                return `https://${normalized}`;
            }
            return normalized;
        })
        .refine(
            (val) => {
                try {
                    new URL(val);
                    return true;
                } catch {
                    return false;
                }
            },
            { message: 'Invalid URL format' }
        ),
});
