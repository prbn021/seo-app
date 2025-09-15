/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Lead } from '../App';

type RawLead = Omit<Lead, 'id' | 'status'>;

/**
 * Finds potential business leads using AI based on a keyword.
 * @param keyword The keyword to search for (e.g., 'SaaS for dentists').
 * @returns A promise that resolves to an array of generated leads.
 */
export const findLeads = async (
    keyword: string,
): Promise<RawLead[]> => {
    console.log(`Finding leads for keyword: ${keyword}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    const prompt = `Find 10 potential business leads for a company that sells '${keyword}'.
For each lead, provide a fictional but valid-looking company name, a plausible website URL, a fictional but valid-looking business contact email, and a fictional but valid-looking phone number.
The leads should be diverse companies that would likely be interested in this product or service. Do not use real company information.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        leads: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    companyName: { type: Type.STRING },
                                    url: { type: Type.STRING },
                                    email: { type: Type.STRING },
                                    phone: { type: Type.STRING },
                                },
                                required: ["companyName", "url", "email", "phone"]
                            }
                        }
                    },
                    required: ["leads"]
                },
            },
        });

        console.log('Received response from model.', response);
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        if (parsed && Array.isArray(parsed.leads)) {
            return parsed.leads as RawLead[];
        } else {
             throw new Error("AI response did not contain a valid 'leads' array.");
        }

    } catch (err) {
        console.error("Error fetching leads from Gemini:", err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        throw new Error(`Failed to generate leads. ${errorMessage}`);
    }
};