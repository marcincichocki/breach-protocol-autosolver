import { Option } from 'commander';

export interface ExperimentalBufferSizeRecognitionOption {
  experimentalBufferSizeRecognition: boolean;
}

const flags = '--experimental-buffer-size-recognition';
const description = 'Use experimental buffer size recognition.';

export const experimentalBufferSizeRecognition = new Option(
  flags,
  description
).default(false);
