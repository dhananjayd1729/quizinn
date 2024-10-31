const axios = require('axios');
const dotenv = require("dotenv");
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

module.exports = async function generateQuizFromText(content) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: `Generate 5 multiple-choice questions from the following content:\n\n${content}` }
                ],
                max_tokens: 500,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.choices[0];
    } catch (error) {
        console.error('Error generating quiz:', error.message);
        throw new Error('Quiz generation failed');
    }
}

