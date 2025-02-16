// import fetch from 'node-fetch';
import { LumaAI } from "lumaai";
require("dotenv").config();

// Access the OpenAI API key from environment variables
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
console.log("API Key:", process.env.NEXT_PUBLIC_OPENAI_API_KEY);

const client = new LumaAI({
  authToken: process.env.NEXT_PUBLIC_LUMAAI_API_KEY,
});

export async function generateImage(prompt) {
  try {
    let generation = await client.generations.image.create({
      prompt: prompt,
    });

    let completed = false;

    while (!completed) {
      generation = await client.generations.get(generation.id);

      if (generation.state === "completed") {
        completed = true;
      } else if (generation.state === "failed") {
        throw new Error(`Generation failed: ${generation.failure_reason}`);
      } else {
        console.log("Dreaming...");
        await new Promise((r) => setTimeout(r, 3000)); // Wait for 3 seconds
      }
    }

    return generation.assets.image; // Return the image URL
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

// Function to call OpenAI API with retries and error handling
export const makeOpenAIRequest = async (message = "") => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // or 'gpt-4' if you have access
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API Error: ${errorData.error?.message || response.status}`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const generateBilingualStory = async (args) => {
  console.log("args", args);
  const {
    targetLanguage,
    vocabLevel,
    numPages,
    ageGroup,
    theme,
    vocabPerPage,
  } = args;
  // Verify API key is present
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY not found in environment variables. Please check your .env file."
    );
  }

  const prompt = `
      I want you to create a short, page-by-page bilingual story in **English** with vocabulary in **${targetLanguage}** at the ${vocabLevel} level.
      **Story Requirements**:
      1. **Number of Pages**: ${numPages}
      2. **Target Age Group**: ${ageGroup}
      3. **Theme or Topic**: ${theme}
      4. **Vocabulary Per Page**: Please include ${vocabPerPage} new ${targetLanguage} words in parentheses with pronunciation and a short English definition.
         - Example Format Within Text: 'Lily felt very **happy (feliz, [feh-lees], happy in Spanish)**.'
      5. **Story Text + Vocabulary List + Picture Description**: For each page, produce:
         - **(a) Story Text (English + integrated ${targetLanguage} words)**: A brief paragraph in English, naturally including the ${targetLanguage} words (with pronunciation and in parentheses).
         - **(b) Vocabulary List**: List only the new ${targetLanguage} words introduced on that page, each with pronunciation and a short English definition.
         - **(c) Picture Description**: A concise but vivid description of the scene for an AI art generator, specifying the consistent illustration style (e.g., 'Bright, whimsical cartoon style with pastel colors and clear outlines').
      **Overall Tone**: Should be appropriate for the specified age group, with clear, simple sentences. Keep the storyline engaging but not too complicated.
      **Example Structure**:
      ---
      **Page 1**:
      **Story Text**: ...
      **Vocabulary List**:
      1. ...
      2. ...
      **Picture Description**: ...
      ---
      Please follow this structure exactly and maintain consistency.
    `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API Error: ${errorData.error?.message || response.status}`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};
