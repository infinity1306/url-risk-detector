const axios = require('axios');

const api = axios.create({
    baseURL: 'http://localhost:5174/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

async function runTest() {
    try {
        console.log("Submitting Request...");
        const res = await api.post('/analyze', { url: 'https://example.com' });
        console.log("Success! Data:", res.data);
    } catch (err) {
        console.error("Axios Error Message:", err.message);
        if (err.response) {
            console.error("Response Data:", err.response.data);
        }
    }
}
runTest();
