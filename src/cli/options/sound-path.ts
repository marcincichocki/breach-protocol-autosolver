import { Option } from 'commander';

// TODO: path validation
const defaultValue = 'C:/Windows/Media/Windows Foreground.wav';
const flags = '--sound-path <path-to-file>';
const description = 'Path to mp3 or wav file that will be played on ocr error.';

export interface SoundPathOption {
  soundPath: string;
}

export const soundPathOption = new Option(flags, description).default(
  defaultValue
);
