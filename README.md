# URL Threat Intelligence Platform

A production-grade MERN stack cybersecurity SaaS product that analyzes URLs for phishing, malware, and other threats using 20 detection modules.

## Quick Start

### Development Mode (Local)

1. **Install dependencies:**
```bash
cd backend && npm install
cd ../frontend && npm install
```

2. **Start MongoDB and Redis:**
```bash
# Using Docker for databases only:
docker run -d --name mongo -p 27017:27017 mongo:7
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

3. **Start backend:**
```bash
cd backend
npm run dev
```

4. **Start frontend:**
```bash
cd frontend
npm run dev
```

5. Open `http://localhost:5173`

### Docker Deployment

```bash
docker-compose up --build
```

Open `http://localhost`

## Architecture

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | React + TailwindCSS + Framer Motion | Cybersecurity dashboard |
| Backend | Node.js + Express + TypeScript | REST API + scan orchestration |
| Database | MongoDB | Scan results, domains, threat indicators |
| Cache | Redis | Result caching, rate limiting |
| Proxy | Nginx | Reverse proxy, SSL termination, static files |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Submit URL for analysis |
| GET | `/api/report/:id` | Get scan results |
| GET | `/api/stats` | Platform statistics |

## 20 Threat Detection Modules

1. Domain Age (WHOIS)
2. SSL/TLS Certificate
3. DNS Consistency
4. IP Reputation & Blacklist
5. Suspicious TLD
6. Punycode Homograph
7. Typosquatting
8. URL Entropy (Shannon)
9. URL Length Anomaly
10. Phishing Keywords
11. Scam Phrases
12. Obfuscated URL Patterns
13. Encoded Payload
14. Redirect Chain
15. Hidden iFrame
16. Meta Refresh
17. Suspicious File Extension
18. Parameter Injection (XSS/SQLi)
19. Form Exfiltration
20. Mixed Content
