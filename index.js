'use strict';
let globalThreadId = null;
let globalAssistantId = null;
let globalRunId = null; // New global variable for storing the run ID
let sessionInfo = null;
let peerConnection = null;
let globalLastAssistantResponse = "Hey";
var BASE_URL = 'https://erstehero-cea845f6c99b.herokuapp.com/';
// var BASE_URL = 'https://erstehero-node.vercel.app/';

window.addEventListener('beforeunload', function (e) {
    stopSession();
    e.preventDefault();
    e.returnValue = 'Close session before leaving by clicking "Close MrErste Session"!';
});

document.addEventListener('DOMContentLoaded', function() {
  const createAssistantBtn = document.getElementById('createAssistant');
  const talkBtn = document.getElementById('talkBtn');
  let taskInputValue = document.getElementById('taskInput').value;

  if (createAssistantBtn) {
      createAssistantBtn.addEventListener('click', async function() {

        const taskInputValueBot = taskInput.value; // Fetch the latest input value
        console.log("taskInputValue", taskInputValueBot)
  
        if (!taskInputValueBot.trim()) {
            alert('Please enter a question.');
            return;
        }

        disableTalkBtns();
        appendUserMessage(taskInputValueBot);
        appendThinkingBubbles();



        if( !sessionInfo ) {
          await createNewSession();
          await startAndDisplaySession();
        }

        await fetchAssistant();
        await createThread();
        await createMessage(document.getElementById('taskInput').value);
        await runAssistant();
        await fetchRunDetailsWithPolling(); // Use the polling version here
        await fetchMessages(); // Fetch and display messages after running the assistant

        await talkHandler();

        removeThinkingBubbles();
        enableTalkBtns();


      });
  }

  if(talkBtn) {
    talkBtn.addEventListener('click', async function() {
      const taskInputValue = taskInput.value; // Fetch the latest input value

      console.log("taskInputValue", taskInputValue)

      if (!taskInputValue.trim()) {
          alert('Please enter a question.');
          return;
      }

      disableTalkBtns();
      appendUserMessage(taskInputValue);
      appendThinkingBubbles();

      await fetchAssistant();
      await createThread();
      await createMessage(taskInputValue);
      await runAssistant();
      await fetchRunDetailsWithPolling(); // Use the polling version here
      // const lastAssistantResponse = await fetchMessages(); // Fetch and display messages after running the assistant
      await fetchMessages();

      removeThinkingBubbles();
      enableTalkBtns();

    })
  }
});

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function disableTalkBtns() {
  const talkBtn = document.getElementById('talkBtns');
  if (talkBtn) {
    talkBtns.classList.add('disabled');
  }
}

function enableTalkBtns() {
  const talkBtn = document.getElementById('talkBtns');
  if (talkBtn) {
    talkBtns.classList.remove('disabled');
  }
}

function appendUserMessage(message) {
  const messageElement = document.createElement('div');
  const chatbox = document.getElementById('chatbox');

  messageElement.textContent = message;
  messageElement.classList.add('user-message');

  const containerElement = document.createElement('div');
  containerElement.classList.add('message-container-user');

  containerElement.appendChild(messageElement);

  if (chatbox) {
    chatbox.appendChild(containerElement);
    setTimeout(() => {
      chatbox.scrollTop = chatbox.scrollHeight;
    }, 1000);
  }
}

function appendAssistantMessage(message) {
  const messageElement = document.createElement('div');
  const chatbox = document.getElementById('chatbox');

  if( messageElement && chatbox) {
    messageElement.textContent = message;
    messageElement.classList.add('assistant-message');

    chatbox.appendChild(messageElement);
  }
}

function appendThinkingBubbles() {
  const chatbox = document.getElementById('chatbox');
  // Create the container for thinking bubbles
  const thinkingBubbles = document.createElement('div');
  thinkingBubbles.classList.add('thinkingBubbles');
  thinkingBubbles.classList.add('assistant-message');

  // Create three dots and append them to the thinkingBubbles container
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot'); // Make sure you have the CSS for .dot as provided earlier
    thinkingBubbles.appendChild(dot);
  }

  if (chatbox) {
    chatbox.appendChild(thinkingBubbles);
  }
}

function removeThinkingBubbles() {
  const thinkingBubbles = document.querySelectorAll('.thinkingBubbles');

  if( thinkingBubbles ) {
    thinkingBubbles.forEach(thinkingBubble => thinkingBubble.remove());
  }
}

// A modified version of fetchRunDetails to include polling
async function fetchRunDetailsWithPolling(maxRetries = 25, interval = 1000) {
  let attempts = 0;

  while (attempts < maxRetries) {
      try {
          const response = await fetch(`${BASE_URL}retrieve-run?threadId=${globalThreadId}&runId=${globalRunId}`);
          const data = await response.json();
          if (data.run.status == "completed") {
              console.log("Run Details: ", data.run);
              // Process your run details here
              return; // Exit the loop and function if data is successfully retrieved
          } else {
              throw new Error("Run details not ready yet");
          }
      } catch (error) {
          console.error('Attempt', attempts + 1, 'failed:', error.message);
          if (attempts === maxRetries - 1) {
              throw new Error("Max retries reached. Failed to fetch run details.");
          }
          await delay(interval); // Wait for the specified interval before retrying
          attempts++;
      }
  }
}

async function fetchAssistant() {
  try {
    if( !globalAssistantId ) {
      const response = await fetch(`${BASE_URL}assistant/create`, { method: 'GET', mode: 'no-cors' });
      const data = await response.json();
      console.log(data);
      globalAssistantId = data.id; // Assuming the assistant's ID is directly under the data object
      console.log(globalAssistantId);
    }
  } catch (error) {
      console.error('Error fetching assistant:', error);
  }
}
async function runAssistant() {

  if (!globalThreadId || !globalAssistantId) {
    console.error('Thread ID or Assistant ID is missing');
    return;
  }

  try {

    const url = new URL(`${BASE_URL}assistant/run`);
    url.searchParams.append('threadId', globalThreadId);
    url.searchParams.append('assistantId', globalAssistantId);
    
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();
    console.log(data.run.id);

    globalRunId = data.run.id;

      // Continue with the next step, if necessary, based on the response
  } catch (error) {
      console.error('Error fetching assistant:', error);
  }
}

async function createMessage(messageContent = "Hi there! Help me.") {

  if (!globalThreadId) {
    console.error('Thread ID is missing');
    return;
  }

  try {
      const response = await fetch(`${BASE_URL}openai-create-message`, {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            threadId: globalThreadId,
            message: messageContent,
          }),
        });
      const data = await response.json();
      console.log(data.message.content);
      // Continue with the next step, if necessary, based on the response
  } catch (error) {
      console.error('Error fetching assistant:', error);
  }
}

async function createThread() {
  try {
    if( !globalThreadId ) {
      const response = await fetch(`${BASE_URL}assistant/thread/create`, { method: 'GET' });
      const data = await response.json();
      console.log(data);
      globalThreadId = data.thread.id; // Adjust according to the actual response structure
      console.log(globalThreadId);
    }
  } catch (error) {
      console.error('Error fetching assistant:', error);
  }
}

async function fetchMessages() {
  if (!globalThreadId) {
    console.error('Thread ID is missing for fetching messages');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}messages/list?threadId=${globalThreadId}`, { method: 'GET' });
    const data = await response.json();
    console.log("Messages: ", data.messages);

    // Sort messages by created_at in ascending order to ensure chronological order
    const sortedMessages = data.messages.sort((a, b) => a.created_at - b.created_at);

    // Filter messages by role and get the last assistant message
    const lastAssistantMessage = sortedMessages.filter(msg => msg.role === "assistant").pop();
    if (lastAssistantMessage) {
      const lastAssistantResponse = lastAssistantMessage.content.find(content => content.type === "text")?.text.value;
      console.log("Last Assistant Response: ", lastAssistantResponse);
      
      // Here you can further process the lastAssistantResponse as needed
      // For example, setting it to a global variable or using it directly in the next steps
      globalLastAssistantResponse = lastAssistantResponse; // Assuming you have such a global variable

      appendAssistantMessage(lastAssistantResponse);
    }

    // Additional processing or displaying of messages can go here

  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

async function fetchRunDetails() {
  try {
      const response = await fetch(`${BASE_URL}retrieve-run?threadId=${globalThreadId}&runId=${globalRunId}`);
      const data = await response.json();
      if (response.ok) {
          console.log("Run Details: ", data.run);
          // Process your run details here
      } else {
          throw new Error(data.error || "Failed to fetch run details");
      }
  } catch (error) {
      console.error('Error fetching run details:', error);
  }
}

const heygen_API = {
  apiKey: 'MjRiNmYyZTNkZjFjNGE5NzlmYjM2YTE2ZTNlZjA3MTEtMTcwODU0ODIzMw==',
  serverUrl: 'https://api.heygen.com',
};

const statusElement = document.querySelector('#status');
const apiKey = heygen_API.apiKey;
const SERVER_URL = heygen_API.serverUrl;

if (apiKey === 'YourApiKey' || SERVER_URL === '') {
  alert('Please enter your API key and server URL in the index.js file');
}



function updateStatus(statusElement, message) {
  statusElement.innerHTML += message + '<br>';
  statusElement.scrollTop = statusElement.scrollHeight;
}

updateStatus(statusElement, '<b>Please click the "Create Session" button to create the stream first.</b>');

function onMessage(event) {
  const message = event.data;
  console.log('Received message:', message);
}

// Create a new WebRTC session when clicking the "New" button
async function createNewSession() {
  updateStatus(statusElement, 'Creating new session... please wait');

  const avatar = avatarName.value;
  const voice = voiceID.value;

  // call the new interface to get the server's offer SDP and ICE server to create a new RTCPeerConnection
  sessionInfo = await newSession('high', avatar, voice);
  const { sdp: serverSdp, ice_servers2: iceServers } = sessionInfo;

  // Create a new RTCPeerConnection
  peerConnection = new RTCPeerConnection({ iceServers: iceServers });

  // When ICE candidate is available, send to the server
  peerConnection.onicecandidate = ({ candidate }) => {
    console.log('Received ICE candidate:', candidate);
    if (candidate) {
      handleICE(sessionInfo.session_id, candidate.toJSON());
    }
  };

  // When ICE connection state changes, display the new state
  peerConnection.oniceconnectionstatechange = (event) => {
    updateStatus(
      statusElement,
      `ICE connection state changed to: ${peerConnection.iceConnectionState}`,
    );
  };

  // When audio and video streams are received, display them in the video element
  peerConnection.ontrack = (event) => {
    console.log('Received the track');
    if (event.track.kind === 'audio' || event.track.kind === 'video') {
      mediaElement.srcObject = event.streams[0];
    }
  };

  // When receiving a message, display it in the status element
  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;
    dataChannel.onmessage = onMessage;
  };

  // Set server's SDP as remote description
  const remoteDescription = new RTCSessionDescription(serverSdp);
  await peerConnection.setRemoteDescription(remoteDescription);

  updateStatus(statusElement, 'Session creation completed');
  updateStatus(statusElement, '<b>Now you can click the "Initialize MrErste" button to start.</b>');
}

// Start session and display audio and video when clicking the "Start" button
async function startAndDisplaySession() {
  if (!sessionInfo) {
    updateStatus(statusElement, 'Please create a connection first');
    return;
  }

  updateStatus(statusElement, 'Starting session... please wait');

  // Create and set local SDP description
  const localDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(localDescription);

  // Start session
  await startSession(sessionInfo.session_id, localDescription);
  updateStatus(statusElement, '<b>Session started successfully. Now you can talk to MrErste by entering message & clicking the "Talk with MrErste" button.</b>');

  setTimeout(() => {
      document.querySelector('#removeBGCheckbox').dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, 100);
}

const taskInput = document.querySelector('#taskInput');

// When clicking the "Send Task" button, get the content from the input field, then send the tas
async function repeatHandler() {
  if (!sessionInfo) {
    updateStatus(statusElement, 'Please create a connection first');

    return;
  }
  updateStatus(statusElement, 'Sending task... please wait');
  const text = taskInput.value;
  if (text.trim() === '') {
    alert('Please enter a task');
    return;
  }

  const resp = await repeat(sessionInfo.session_id, text);

  updateStatus(statusElement, 'Task sent successfully');
}

async function talkHandler() {
  if (!sessionInfo) {
    updateStatus(statusElement, 'Please create a connection first');
    return;
  }
  const output = globalLastAssistantResponse; // Using the same input for simplicity
  if (output.trim() === '') {
    alert('Please enter a prompt for the LLM');
    return;
  }

  updateStatus(statusElement, 'Talking to LLM... please wait');

  try {
    const text = await talkToOpenAI(output)

    if (text) {
      // Send the AI's response to Heygen's streaming.task API
      const resp = await repeat(sessionInfo.session_id, text);
      updateStatus(statusElement, 'LLM response sent successfully');
    } else {
      updateStatus(statusElement, 'Failed to get a response from AI');
    }
  } catch (error) {
    console.error('Error talking to AI:', error);
    updateStatus(statusElement, 'Error talking to AI');
  }
}


// when clicking the "Close" button, close the connection
async function closeConnectionHandler() {
  if (!sessionInfo) {
    updateStatus(statusElement, 'Please create a connection first');
    return;
  }

  renderID++;
  hideElement(canvasElement);
  hideElement(bgCheckboxWrap);
  mediaCanPlay = false;

  updateStatus(statusElement, 'Closing connection... please wait');
  try {
    // Close local connection
    peerConnection.close();
    // Call the close interface
    const resp = await stopSession(sessionInfo.session_id);

    console.log(resp);
  } catch (err) {
    console.error('Failed to close the connection:', err);
  }
  updateStatus(statusElement, 'Connection closed successfully');
}

document.querySelector('#newBtn').addEventListener('click', createNewSession);
document.querySelector('#startBtn').addEventListener('click', startAndDisplaySession);
document.querySelector('#repeatBtn').addEventListener('click', repeatHandler);
document.querySelector('#closeBtn').addEventListener('click', closeConnectionHandler);
// document.querySelector('#talkBtn').addEventListener('click', talkHandler);


// new session
async function newSession(quality, avatar_name, voice_id) {
  const response = await fetch(`${SERVER_URL}/v1/streaming.new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      quality,
      avatar_name,
      voice: {
        voice_id: voice_id,
      },
    }),
  });
  if (response.status === 500) {
    console.error('Server error');
    updateStatus(
      statusElement,
      'Server Error. Please ask the staff if the service has been turned on',
    );

    throw new Error('Server error');
  } else {
    const data = await response.json();
    console.log(data.data);
    return data.data;
  }
}

// start the session
async function startSession(session_id, sdp) {
  const response = await fetch(`${SERVER_URL}/v1/streaming.start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ session_id, sdp }),
  });
  if (response.status === 500) {
    console.error('Server error');
    updateStatus(
      statusElement,
      'Server Error. Please ask the staff if the service has been turned on',
    );
    throw new Error('Server error');
  } else {
    const data = await response.json();
    return data.data;
  }
}

// submit the ICE candidate
async function handleICE(session_id, candidate) {
  const response = await fetch(`${SERVER_URL}/v1/streaming.ice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ session_id, candidate }),
  });
  if (response.status === 500) {
    console.error('Server error');
    updateStatus(
      statusElement,
      'Server Error. Please ask the staff if the service has been turned on',
    );
    throw new Error('Server error');
  } else {
    const data = await response.json();
    return data;
  }
}

async function talkToOpenAI(prompt) {
  const response = await fetch(`${BASE_URL}openai/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  if (response.status === 500) {
    console.error('Server error');
    updateStatus(
      statusElement,
      'Server Error. Please make sure to set the openai api key',
    );
    throw new Error('Server error');
  } else {
    const data = await response.json();
    return data.text;
  }
}

// repeat the text
async function repeat(session_id, text) {
  const response = await fetch(`${SERVER_URL}/v1/streaming.task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ session_id, text }),
  });
  if (response.status === 500) {
    console.error('Server error');
    updateStatus(
      statusElement,
      'Server Error. Please ask the staff if the service has been turned on',
    );
    throw new Error('Server error');
  } else {
    const data = await response.json();
    return data.data;
  }
}

// stop session
async function stopSession(session_id) {
  const response = await fetch(`${SERVER_URL}/v1/streaming.stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ session_id }),
  });
  if (response.status === 500) {
    console.error('Server error');
    updateStatus(statusElement, 'Server Error. Please ask the staff for help');
    throw new Error('Server error');
  } else {
    const data = await response.json();
    return data.data;
  }
}

const removeBGCheckbox = document.querySelector('#removeBGCheckbox');
removeBGCheckbox.addEventListener('click', () => {
  const isChecked = removeBGCheckbox.checked; // status after click

  if (isChecked && !sessionInfo) {
    updateStatus(statusElement, 'Please create a connection first');
    removeBGCheckbox.checked = false;
    return;
  }

  if (isChecked && !mediaCanPlay) {
    updateStatus(statusElement, 'Please wait for the video to load');
    removeBGCheckbox.checked = false;
    return;
  }

  if (isChecked) {
    hideElement(mediaElement);
    showElement(canvasElement);

    renderCanvas();
  } else {
    hideElement(canvasElement);
    showElement(mediaElement);

    renderID++;
  }
});

let renderID = 0;
function renderCanvas() {
  if (!removeBGCheckbox.checked) return;
  hideElement(mediaElement);
  showElement(canvasElement);

  canvasElement.classList.add('show');

  const curRenderID = Math.trunc(Math.random() * 1000000000);
  renderID = curRenderID;

  const ctx = canvasElement.getContext('2d', { willReadFrequently: true });

  if (bgInput.value) {
    canvasElement.parentElement.style.background = bgInput.value?.trim();
  }

  function processFrame() {
    if (!removeBGCheckbox.checked) return;
    if (curRenderID !== renderID) return;

    canvasElement.width = mediaElement.videoWidth;
    canvasElement.height = mediaElement.videoHeight;

    ctx.drawImage(mediaElement, 0, 0, canvasElement.width, canvasElement.height);
    ctx.getContextAttributes().willReadFrequently = true;
    const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      // You can implement your own logic here
      if (isCloseToGreen([red, green, blue])) {
        // if (isCloseToGray([red, green, blue])) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    requestAnimationFrame(processFrame);
  }

  processFrame();
}

function isCloseToGreen(color) {
  const [red, green, blue] = color;
  return green > 90 && red < 90 && blue < 90;
}

function hideElement(element) {
  element.classList.add('hide');
  element.classList.remove('show');
}
function showElement(element) {
  element.classList.add('show');
  element.classList.remove('hide');
}

const mediaElement = document.querySelector('#mediaElement');
let mediaCanPlay = false;
mediaElement.onloadedmetadata = () => {
  mediaCanPlay = true;
  mediaElement.play();

  showElement(bgCheckboxWrap);
};
const canvasElement = document.querySelector('#canvasElement');

const bgCheckboxWrap = document.querySelector('#bgCheckboxWrap');
const bgInput = document.querySelector('#bgInput');
bgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    renderCanvas();
  }
});
