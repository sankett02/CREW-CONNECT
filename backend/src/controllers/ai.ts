import { Request, Response } from 'express';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const generateProjectBrief = async (req: Request, res: Response) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ message: 'Topic is required' });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert creative recruiter. 
                    Your goal is to transform a single topic into a clean, professional project brief.
                    
                    Sections to include in "description":
                    PROJECT OVERVIEW
                    KEY RESPONSIBILITIES
                    EXECUTION PHASE
                    FINAL DELIVERABLES
                    
                    IMPORTANT: Use clear headings in ALL CAPS. Use double newlines (\n\n) between sections. Use bullet points (*) for lists. 
                    Structure the text so it is highly readable and professional.
                    
                    Return a JSON object with:
                    1. "title": A concise project title.
                    2. "description": The clean text job description (with double newlines between segments).
                    3. "niche": One of ["YouTube", "Instagram", "TikTok", "Shorts/Reels", "UGC", "Podcast", "Branding", "Photography", "Animation", "Software", "Web Development", "Writing", "Other"].
                    
                    Format: PURE JSON object only. Do not include any text outside the JSON.`,
                },
                {
                    role: 'user',
                    content: `Generate a project brief for: ${topic}`,
                },
            ],
            // llama-3.3-70b-versatile is the current flagship stable model
            model: 'llama-3.3-70b-versatile',
            temperature: 0.6,
            max_tokens: 1024,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content returned from AI');
        }

        // Clean potentially markdown-wrapped JSON response
        const cleanContent = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        
        try {
            const brief = JSON.parse(cleanContent);
            res.status(200).json(brief);
        } catch (parseError) {
            console.error('AI JSON Parse Error:', parseError, 'Raw Content:', content);
            throw new Error('Failed to parse AI response as valid JSON');
        }
    } catch (error: any) {
        console.error('AI Generation Error:', error.message || error);
        res.status(500).json({ 
            message: 'Failed to generate brief', 
            error: error.message || 'Unknown AI error' 
        });
    }
};
