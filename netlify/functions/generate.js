const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // IMPORTANT: In your Netlify project settings, you MUST set an environment variable
    // named GEMINI_API_KEY with your actual Google API key.
    const apiKey = process.env.GEMINI_API_KEY;

    // For local testing, you can temporarily hardcode it, but DO NOT commit this.
    // const apiKey = 'AIzaSyAkPS45eQkdmKrJkb-ExGOUDdxMzKhSGAY';

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'GEMINI_API_KEY is not set in Netlify environment variables.' })
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Allow': 'POST' }
        };
    }

    try {
        const { contents, systemInstruction, generationConfig } = JSON.parse(event.body);
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
            return {
                statusCode: response.status,
                body: JSON.stringify(data)
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process request.' })
        };
    }
};
