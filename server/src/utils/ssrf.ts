import dns from 'dns';
import { URL } from 'url';
import net from 'net';

const BLOCKED_IP_RANGES = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^0\./,
    /^169\.254\./,
    /^224\./,
    /^240\./,
    /^255\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
    /^fd/,
];

const BLOCKED_HOSTNAMES = ['localhost', 'metadata.google.internal', '169.254.169.254'];

export const isPrivateIP = (ip: string): boolean => {
    return BLOCKED_IP_RANGES.some((range) => range.test(ip));
};

export const validateUrlSSRF = async (urlString: string): Promise<{ safe: boolean; reason?: string; resolvedIP?: string }> => {
    try {
        const parsed = new URL(urlString);

        // Block non-HTTP(S) protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return { safe: false, reason: 'Only HTTP and HTTPS protocols are allowed' };
        }

        // Block reserved hostnames
        if (BLOCKED_HOSTNAMES.includes(parsed.hostname.toLowerCase())) {
            return { safe: false, reason: 'Hostname is blocked (internal/reserved)' };
        }

        // Block direct IP addresses in private ranges
        if (net.isIP(parsed.hostname)) {
            if (isPrivateIP(parsed.hostname)) {
                return { safe: false, reason: 'Direct private IP addresses are prohibited' };
            }
            return { safe: true, resolvedIP: parsed.hostname };
        }

        // DNS resolution check
        const addresses = await new Promise<string[]>((resolve, reject) => {
            dns.resolve4(parsed.hostname, (err, addrs) => {
                if (err) {
                    // If domain doesn't exist, it's technically "safe" from SSRF (can't point to internal IP)
                    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
                        return resolve([]);
                    }
                    return reject(err);
                }
                resolve(addrs);
            });
        });

        // Check all resolved IPs
        for (const ip of addresses) {
            if (isPrivateIP(ip)) {
                return { safe: false, reason: `Domain resolves to private IP: ${ip}` };
            }
        }

        return { safe: true, resolvedIP: addresses[0] };
    } catch (error: any) {
        return { safe: false, reason: `DNS resolution failed: ${error.message}` };
    }
};
