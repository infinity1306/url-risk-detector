const http = require('http');

const data = JSON.stringify({ url: 'https://example.com' });

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/analyze',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    let result = '';
    res.on('data', d => {
        result += d;
    });
    res.on('end', () => {
        console.log('Analyze Response:', result);
        const parsed = JSON.parse(result);
        if (parsed.success) {
            const scanId = parsed.data.scanId;
            console.log('Polling for result...', scanId);

            const poll = setInterval(() => {
                http.get(`http://localhost:5000/api/report/${scanId}`, r => {
                    let rData = '';
                    r.on('data', d => rData += d);
                    r.on('end', () => {
                        const rParsed = JSON.parse(rData);
                        console.log('Status:', rParsed?.data?.status);
                        if (rParsed?.data?.status === 'COMPLETED' || rParsed?.data?.status === 'FAILED') {
                            clearInterval(poll);
                            console.log('Final Result:', JSON.stringify(rParsed, null, 2));
                        }
                    });
                });
            }, 2000);
        }
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
