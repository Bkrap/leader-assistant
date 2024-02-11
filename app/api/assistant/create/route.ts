import OpenAI from "openai";

export async function GET() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Use the API key from .env
  });

  try {
    const assistant = await openai.beta.assistants.retrieve('asst_HWcrQG4qhKpu271U8ZirSdAd');
    console.log(assistant);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assistant }),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.toString() }),
    };
  }
}