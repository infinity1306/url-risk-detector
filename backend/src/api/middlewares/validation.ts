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
                    details: error.errors.map((e) => ({
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
            let normalized = val.trim().toLowerCase();
            
            // Remove trailing slash for consistency
            if (normalized.endsWith('/')) {
                normalized = normalized.slice(0, -1);
            }

            // Auto-append .com if no extension and not localhost/IP
            if (!normalized.includes('.') && 
                normalized !== 'localhost' && 
                !normalized.startsWith('http')) {
                normalized = `${normalized}.com`;
            }

            // Ensure protocol
            if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
                normalized = `https://${normalized}`;
            }

            return normalized;
        })
        .refine(
            (val) => {
                try {
                    const parsed = new URL(val);
                    return parsed.hostname.length > 0;
                } catch {
                    return false;
                }
            },
            { message: 'Invalid URL format. Please enter a valid website address.' }
        ),
});
