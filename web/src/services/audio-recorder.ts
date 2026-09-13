export interface AudioRecorder {
  start(): Promise<void>;
  stop(): Promise<Blob>;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, value: string): void => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

export function createAudioRecorder(): AudioRecorder {
  let context: AudioContext | undefined;
  let stream: MediaStream | undefined;
  let processor: ScriptProcessorNode | undefined;
  let source: MediaStreamAudioSourceNode | undefined;
  let monitor: GainNode | undefined;
  let samples: Float32Array[] = [];

  return {
    async start() {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      context = new AudioContext();
      source = context.createMediaStreamSource(stream);
      processor = context.createScriptProcessor(4096, 1, 1);
      monitor = context.createGain();
      monitor.gain.value = 0;
      samples = [];
      processor.onaudioprocess = (event) => samples.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      source.connect(processor);
      processor.connect(monitor);
      monitor.connect(context.destination);
    },
    async stop() {
      if (!context || !stream) throw new Error('Recording is not active.');
      const sampleRate = context.sampleRate;
      processor?.disconnect();
      source?.disconnect();
      monitor?.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      await context.close();
      context = undefined;
      stream = undefined;
      processor = undefined;
      source = undefined;
      monitor = undefined;
      const length = samples.reduce((total, chunk) => total + chunk.length, 0);
      const combined = new Float32Array(length);
      let offset = 0;
      for (const chunk of samples) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      samples = [];
      return encodeWav(combined, sampleRate);
    }
  };
}
