import OpenAI from "openai";

export async function GET() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Use the API key from .env
  });

  try {
    const assistant = await openai.beta.assistants.retrieve('asst_HWcrQG4qhKpu271U8ZirSdAd');
    console.log(assistant);
    return new Response(JSON.stringify({ assistant }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.log(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}