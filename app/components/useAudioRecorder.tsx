import { useState, useEffect, useCallback } from 'react';

const useAudioRecorder = () => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const newRecorder = new MediaRecorder(stream);
      setRecorder(newRecorder);

      let audioChunks: BlobPart[] = [];

      newRecorder.ondataavailable = e => {
        audioChunks.push(e.data);
        if (newRecorder.state === "inactive") {
          let mp3Blob = new Blob(audioChunks, { type: 'audio/mp3' });
          setAudioBlob(mp3Blob);
        }
      };

      newRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error(error);
      if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        // No microphone was found
        alert("No microphone device was found.");
      } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        // Permissions have not been granted to use the microphone
        alert("Permissions to access the microphone were denied.");
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        // The microphone is already in use
        alert("The microphone is currently in use by another application.");
      } else {
        // Some other error occurred
        alert("An unknown error occurred when trying to access the microphone.");
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false);
    }
  }, [recorder]);

  useEffect(() => {
    return () => {
      audioStream?.getTracks().forEach(track => track.stop());
    };
  }, [audioStream]);

  return { startRecording, stopRecording, isRecording, audioBlob };
};

export default useAudioRecorder;
