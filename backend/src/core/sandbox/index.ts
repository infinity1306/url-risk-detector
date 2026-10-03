import axios from 'axios';
import https from 'https';
import tls from 'tls';
import dns from 'dns';
import { URL } from 'url';
import { ScanContext } from '../engine/types';
import { validateUrlSSRF } from '../../utils/ssrf';
import { config } from '../../config';
import { logger } from '../../utils/logger';

/**
 * Secure HTTP Crawling Sandbox
 * Fetches URL content safely with SSRF protection, timeouts, and size limits.
 */
export async function buildScanContext(urlString: string): Promise<ScanContext> {
    const parsedUrl = new URL(urlString);
    const hostname = parsedUrl.hostname;
    const tld = '.' + hostname.split('.').pop();
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    const queryParams: Record<string, string> = {};
    parsedUrl.searchParams.forEach((v, k) => (queryParams[k] = v));

    // SSRF Check
    const ssrfCheck = await validateUrlSSRF(urlString);
    if (!ssrfCheck.safe) {
        throw new Error(`SSRF blocked: ${ssrfCheck.reason}`);
    }

    // SSL Info
    let sslInfo = {
        valid: false,
        issuer: '',
        expiresAt: null as Date | null,
        protocol: '',
        selfSigned: false,
    };

    // WHOIS Data
    let whoisData = {
        creationDate: null as Date | null,
        expirationDate: null as Date | null,
        registrar: '',
        country: '',
        nameServers: [] as string[],
    };

    // HTTP Request with redirect tracking
    const redirectChain: string[] = [];
    let responseBody = '';
    let responseHeaders: Record<string, string> = {};
    let statusCode = 0;

    // Fetch SSL, WHOIS, and HTTP data concurrently
    const [sslResult, whoisResult, httpResult] = await Promise.allSettled([
        // SSL Check (4s timeout)
        parsedUrl.protocol === 'https:'
            ? Promise.race([
                  getSSLInfo(hostname),
                  new Promise<any>((_, reject) => setTimeout(() => reject(new Error('SSL Timeout')), 4000)),
              ])
            : Promise.resolve(sslInfo),

        // WHOIS Check (4s timeout)
        Promise.race([
            new Promise<any>((resolve, reject) => {
                try {
                    const whois = require('whois-json');
                    whois(hostname).then(resolve).catch(reject);
                } catch (e) {
                    reject(e);
                }
            }),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error('WHOIS Timeout')), 4000)),
        ]),

        // HTTP Fetch (5s timeout)
        axios.get(urlString, {
            timeout: 5000,
            maxRedirects: 3,
            maxContentLength: 500 * 1024, // 500KB max for speed
            headers: {
                'User-Agent': 'URLThreatIntel/1.0 SecurityScanner',
                Accept: 'text/html,application/xhtml+xml',
            },
            validateStatus: () => true, // Accept all status codes
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            beforeRedirect: (options: any, responseDetails: any) => {
                redirectChain.push(responseDetails.headers?.location || options.href || '');
            },
        }),
    ]);

    // Parse SSL Results
    if (sslResult.status === 'fulfilled' && sslResult.value && sslResult.value.valid !== undefined) {
        sslInfo = sslResult.value as any;
    } else if (sslResult.status === 'rejected') {
        logger.warn(`SSL check failed: ${sslResult.reason?.message}`);
    }

    // Parse WHOIS Results
    if (whoisResult.status === 'fulfilled' && whoisResult.value) {
        const result = whoisResult.value;
        whoisData.creationDate = result.creationDate ? new Date(result.creationDate) : null;
        whoisData.expirationDate = result.expirationDate ? new Date(result.expirationDate) : null;
        whoisData.registrar = result.registrar || '';
        whoisData.country = result.registrantCountry || '';
        whoisData.nameServers = result.nameServer
            ? Array.isArray(result.nameServer)
                ? result.nameServer
                : [result.nameServer]
            : [];
    } else if (whoisResult.status === 'rejected') {
        logger.warn(`WHOIS check failed: ${whoisResult.reason?.message}`);
    }

    // Parse HTTP Results
    if (httpResult.status === 'fulfilled' && httpResult.value) {
        const response = httpResult.value;
        responseBody = typeof response.data === 'string' ? response.data : '';
        statusCode = response.status;
        responseHeaders = {};
        for (const [key, value] of Object.entries((response as any).headers || {})) {
            if (typeof value === 'string') {
                responseHeaders[key] = value;
            } else if (Array.isArray(value) && value.length > 0) {
                responseHeaders[key] = String(value[0]);
            }
        }
    } else if (httpResult.status === 'rejected') {
        logger.warn(`HTTP fetch failed for ${urlString}: ${httpResult.reason?.message}`);
        statusCode = 0;
    }

    return {
        originalUrl: urlString,
        parsedUrl,
        hostname,
        tld,
        pathSegments,
        queryParams,
        resolvedIP: ssrfCheck.resolvedIP || '',
        responseHeaders,
        responseBody: responseBody.substring(0, 500000), // Cap at 500KB for analysis
        statusCode,
        redirectChain,
        sslInfo,
        whoisData,
    };
}

async function getSSLInfo(hostname: string): Promise<{
    valid: boolean;
    issuer: string;
    expiresAt: Date | null;
    protocol: string;
    selfSigned: boolean;
}> {
    return new Promise((resolve, reject) => {
        const socket = tls.connect(
            { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false, timeout: 4000 },
            () => {
                const cert = socket.getPeerCertificate();
                const authorized = socket.authorized;

                const rawProtocol = (socket as any).getProtocol();
                const protocolStr = Array.isArray(rawProtocol) ? rawProtocol[0] : rawProtocol;

                const resultPayload = {
                    valid: authorized,
                    issuer: cert.issuer ? cert.issuer.O || cert.issuer.CN || '' : '',
                    expiresAt: cert.valid_to ? new Date(cert.valid_to) : null,
                    selfSigned: !authorized && cert.issuer?.CN === cert.subject?.CN,
                };

                (resultPayload as any).protocol = String(protocolStr || '');
                resolve(resultPayload as any);

                socket.end();
            }
        );

        socket.on('error', reject);
        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('SSL connection timeout'));
        });
    });
}
