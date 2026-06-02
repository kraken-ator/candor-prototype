const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); // Allow your frontend to talk to this backend
app.use(express.json()); // Allow the backend to parse JSON bodies

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

// This is the route your frontend will call
app.post('/api/candor', async (req, res) => {
    try {
        const { userPrompt, systemPrompt } = req.body;

        // The URL now lives securely on the server
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

        // Forward the request to the Gemini API
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                generationConfig: { 
                    maxOutputTokens: 8192, 
                    temperature: 0.7,
                    responseMimeType: "application/json" // Forces Gemini to return strict, clean JSON
                }
            })
        });

        // Handle Gemini API errors
        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }

        // Send the successful data back to the frontend
        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: { message: "Internal server error" } });
    }
});

app.listen(PORT, () => {
    console.log(`Secure backend running on http://localhost:${PORT}`);
});