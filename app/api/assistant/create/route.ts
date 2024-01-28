import OpenAI from "openai";

export async function GET() {
  const openai = new OpenAI();
  const secretKey = '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';
  // const openai = new OpenAI({
  //   apiKey: secretKey,
  //   dangerouslyAllowBrowser: true,
  // });
  // Create a thread
  // const thread = await openai.beta.threads.create();

  try {
    const assistant = await openai.beta.assistants.retrieve('asst_HWcrQG4qhKpu271U8ZirSdAd');

    console.log(assistant);

    return Response.json({ assistant: assistant });
  } catch (e) {
    console.log(e);
    return Response.json({ error: e });
  }
}
