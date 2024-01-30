import React, { useState, useEffect } from 'react';
import useAudioRecorder from './useAudioRecorder';

const AudioTranscriptionComponent: React.FC = () => {
  const { startRecording, stopRecording, isRecording, audioBlob } = useAudioRecorder();
  const [audioSrc, setAudioSrc] = useState<string>('');

  useEffect(() => {
    if (audioBlob) {
      convertTextToSpeech();
    }
  }, [audioBlob]);

  const convertTextToSpeech = async () => {
    try {
      const payload = {
        model: "tts-1",
        input: "Your text data here",  // Replace with the actual text
        voice: "onyx"
      };

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.arrayBuffer();
      const blob = new Blob([data], { type: 'audio/ogg' });
      setAudioSrc(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Error converting text to speech:', error);
    }
  };

  return (
    <div>
      {isRecording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
};

export default AudioTranscriptionComponent;
