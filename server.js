require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    try {
        const { message, vehicleType } = req.body;
        
        const autoMaintenanceContext = `You are an AI auto maintenance advisor. Provide specific maintenance advice for ${vehicleType || 'vehicles'}.
        Focus on:
        - Regular maintenance schedules
        - Common issues and troubleshooting
        - Service intervals
        - Repair guidance
        - Performance optimization
        - Safety checks
        
        Include practical tips, estimated costs, and DIY-friendly advice when appropriate.
        Keep responses concise and actionable.`;
        
        const fullPrompt = `${autoMaintenanceContext}\n\nUser query: ${message}`;
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: fullPrompt }] }]
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

