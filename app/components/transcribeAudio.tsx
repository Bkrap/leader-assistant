// const transcribeAudio = async (audioBlob) => {
//     try {
//       const formData = new FormData();
//       formData.append('file', audioBlob);
  
//       // Replace this URL with the API endpoint of the transcription service
//       const response = await fetch('API_ENDPOINT', {
//         method: 'POST',
//         headers: {
//           // Add necessary headers
//         },
//         body: formData,
//       });

//       let response = await fetch('https://api.openai.com/v1/audio/', {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${OPENAI_API_KEY}`,	
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             "model": "tts-1-hd",
//             "input": textData,
//             "voice": "onyx"
//         }),
//         responseType: "arraybuffer"
  
//       if (!response.ok) {
//         throw new Error('Audio transcription failed');
//       }
  
//       const result = await response.json();
//       console.log('Transcription result:', result);
//       // Set the transcription to a state variable or handle as needed
//     } catch (error) {
//       console.error('Error transcribing audio:', error);
//     }
//   };
  