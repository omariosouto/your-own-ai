import { useState, useEffect } from 'react';

const useMicrophone = ({ recordingTimeout }: {
  /** Must be provided in miliseconds */
  recordingTimeout?: number;
} = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [audioData, setAudioData] = useState(null);

  // Função para começar a gravação
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsRecording(true);

      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioData(audioBlob);
      };

      mediaRecorder.start();

      // Para parar o gravador automaticamente após um tempo
      recordingTimeout && setTimeout(() => {
        mediaRecorder.stop();
        stopRecording();
      }, recordingTimeout);
    } catch (error) {
      console.error('Erro ao acessar o microfone:', error);
    }
  };

  // Função para parar a gravação e limpar o stream de áudio
  const stopRecording = () => {
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setAudioStream(null);
  };

  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioStream]);

  return { isRecording, startRecording, stopRecording, audioData };
};

export default useMicrophone;
