const express = require('express');
const OpenAI = require('openai')
const path = require('path');
const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.json());

// Create assistant
app.get('/assistant/create', async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const assistant = await openai.beta.assistants.retrieve('asst_nzCHMuob0o95oai9lMKMl6IC');
    console.log(assistant);

    res.status(200).json(assistant);
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';

    res.status(500).json({ error: errorMessage });
  }
});

// Create thread
app.get('/assistant/thread/create', async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const thread = await openai.beta.threads.create();
    console.log(thread);
    res.json({ thread: thread });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e });
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemSetup = "you are a demo streaming avatar from HeyGen, an industry-leading AI generation product that specialize in AI avatars and videos.\nYou are here to showcase how a HeyGen streaming avatar looks and talks.\nPlease note you are not equipped with any specific expertise or industry knowledge yet, which is to be provided when deployed to a real customer's use case.\nAudience will try to have a conversation with you, please try answer the questions or respond their comments naturally, and concisely. - please try your best to response with short answers, limit to one sentence per response, and only answer the last question."

app.use(express.static(path.join(__dirname, '.')));


// Run Assistant
app.get('/assistant/run', async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { threadId, assistantId } = req.query;
  if (!threadId) return res.status(400).json({ error: "No thread id provided" });
  if (!assistantId) return res.status(400).json({ error: "No assistant id provided" });

  try {
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    console.log({ run: run });

    res.json({ run: run });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e });
  }
});

//Create Message
app.post('/openai-create-message', async (req, res) => {

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { message, threadId } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ error: "Invalid message" });
  }

  try {
    const threadMessage = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    console.log(threadMessage);

    res.json({ message: threadMessage });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e });
  }
});

app.get('/messages/list', async (req, res) => {

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

  const { threadId } = req.query;

  if (!threadId) {
    return res.status(400).json({ error: "No threadId provided" });
  }

  try {
    const response = await openai.beta.threads.messages.list(threadId);

    console.log(response);
    res.json({ messages: response.data }); // Adjust according to the actual structure of the response
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});

app.get('/retrieve-run', async (req, res) => {

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { threadId, runId } = req.query;

  if (!threadId || !runId) {
      return res.status(400).json({ error: "Both thread id and run id must be provided" });
  }

  try {
      const run = await openai.beta.threads.runs.retrieve(threadId, runId);
      console.log(run);
      res.json({ run: run });
  } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to retrieve run" });
  }
});

// Connected to heygen doll final output
app.post('/openai/complete', async (req, res) => {
  try {
    console.log(req.body);
    res.json({ text: req.body.prompt });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).send('Error processing your request');
  }
});

// app.post('/openai/complete', async (req, res) => {
//   try {
//     const lastAssistantResponse = await fetchMessages(); // Call your function to fetch messages

//     if (!lastAssistantResponse) {
//       return res.json({ text: "There are no recent assistant messages." });
//     }

//     const openAIResponse = await talkToOpenAI(lastAssistantResponse);
//     res.json({ text: openAIResponse });
//   } catch (error) {
//     console.error('Error processing request:', error);
//     res.status(500).send('Error processing your request');
//   }
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}!`);
});