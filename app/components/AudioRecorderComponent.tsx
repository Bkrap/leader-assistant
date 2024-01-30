import React, { useState, useEffect } from 'react';
import useAudioRecorder from './useAudioRecorder';
import SpeechGenerator from './SpeechGenerator';
import recPlay from '../../public/recPlay.png';

interface AudioRecorderComponentProps {
  onTranscriptionComplete: (transcription: string) => void;
}

const AudioRecorderComponent: React.FC<AudioRecorderComponentProps> = ({ onTranscriptionComplete }) => {
  const { startRecording, stopRecording, isRecording, audioBlob } = useAudioRecorder();
  const [transcription, setTranscription] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    if (audioBlob) {
      // Create a URL for the audioBlob and set it to audioUrl state
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      transcribeAudio(audioBlob);
    }
  }, [audioBlob]);

  const transcribeAudio = async (blob: Blob) => {
    try {
      
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("model", "whisper-1");

      const response = await fetch('https://api.openai.com/v1/audio/translations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`,
        },
        body: formData
      });

      if (!response.ok) {
        // throw new Error(response);
        console.log("response.status", response.status);
      }

      const result = await response.json();
      console.log("API Response:", result); // Check the structure of the response
      setTranscription(result.text); // Adjust based on the actual response structure
      onTranscriptionComplete(result.text); // Call the callback with the transcription
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert(error);
    }
  };

  return (
    <div>
      {isRecording ? (
        <button style={{ backgroundImage: `url('${recPlay})'` }} onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button style={{ backgroundImage: `url('${recPlay})'` }} onClick={startRecording}>Start Recording</button>
      )}
      <div>
      {audioUrl && (
        <div>
          <p>Recorded Audio:</p>
          <audio src={audioUrl} controls />
        </div>
      )}
        {/* Just output -> {transcription && <p>Transcription: {transcription}</p>} */}
      </div>
    </div>
  );
};

export default AudioRecorderComponent;
