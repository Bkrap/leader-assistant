import React, { useState, useEffect } from 'react';

interface SpeechGeneratorProps {
  textData: string;
}

const SpeechGenerator: React.FC<SpeechGeneratorProps> = ({ textData }) => {
  const [audioSrc, setAudioSrc] = useState<string>('');

  const generateSpeech = async () => {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "model": "tts-1",
          "input": textData,
          "voice": "onyx"
        }),
      });

      if (!response.ok) {
        throw new Error(`${response.statusText} response not ok!`);
      }

      const data = await response.arrayBuffer();
      const blob = new Blob([data], { type: 'audio/ogg' });
      const audioSrc = URL.createObjectURL(blob);
      setAudioSrc(audioSrc);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (textData) {
      generateSpeech();
    }
  }, [textData]);

  return (
    <div className="generated-audio-result">
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
};

export default SpeechGenerator;
