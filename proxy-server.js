const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = 3000;

// IMPORTANT: Move your API key to an environment variable for production.
// Do not keep it in the source code.
// Example: const apiKey = process.env.GEMINI_API_KEY;
const apiKey = 'AIzaSyAkPS45eQkdmKrJkb-ExGOUDdxMzKhSGAY';
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please set it as an environment variable.");
}

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable parsing of JSON request bodies

// Proxy endpoint
app.post('/api/generate', async (req, res) => {
    const { contents, systemInstruction, generationConfig } = req.body;

    if (!contents) {
        return res.status(400).json({ error: 'Missing "contents" in request body' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                systemInstruction,
                generationConfig
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API Error Response:', data);
            return res.status(response.status).json(data);
        }

        res.json(data);

    } catch (error) {
        console.error('Error proxying request:', error);
        res.status(500).json({ error: 'Failed to proxy request to Gemini API.' });
    }
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
