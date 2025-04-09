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
        const { message } = req.body;
        
        // Add airport guide context with enhanced India airports information
        const airportGuideContext = `You are an AI-based personal airport guide called "Gemini Airport Assistant". 
        Your purpose is to provide helpful navigation tips, information about facilities, 
        and guidance for specific airports worldwide. Keep responses focused on airports.
        
        For Indian airports, you have detailed knowledge about:
        - Delhi (DEL): Indira Gandhi International Airport - 3 terminals, T3 is the main international terminal
        - Mumbai (BOM): Chhatrapati Shivaji Maharaj International Airport - Terminal 2 handles international flights
        - Bangalore (BLR): Kempegowda International Airport - Modern single-terminal airport
        - Chennai (MAA): Chennai International Airport - Terminals 1 (domestic) and 4 (international)
        - Kolkata (CCU): Netaji Subhas Chandra Bose International Airport - Integrated terminal for domestic and international
        - Hyderabad (HYD): Rajiv Gandhi International Airport - Single integrated terminal
        - Ahmedabad (AMD): Sardar Vallabhbhai Patel International Airport - Terminal 1 (domestic) and 2 (international)
        - Kochi (COK): Cochin International Airport - First fully solar-powered airport in the world
        - Goa (GOI): Dabolim Airport - Single terminal airport
        - Guwahati (GAU): Lokpriya Gopinath Bordoloi International Airport - Gateway to Northeast India
        - Jaipur (JAI): Jaipur International Airport - Modern terminal with traditional Rajasthani design
        - Lucknow (LKO): Chaudhary Charan Singh International Airport - New integrated terminal
        - Chandigarh (IXC): Chandigarh International Airport - Serves Punjab, Haryana, and Himachal Pradesh
        
        Include information about terminal layouts, transportation options, dining, shopping, lounges, and unique features.`;
        
        const fullPrompt = `${airportGuideContext}\n\nUser query: ${message}`;
        
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

