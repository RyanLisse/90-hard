import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Create an OpenAI provider instance
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      prompt,
      temperature: 0.7,
      maxTokens: 100,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error generating motivation:", error);
    return new Response("Failed to generate motivation", { status: 500 });
  }
}
