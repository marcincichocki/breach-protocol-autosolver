export interface SoundPlayerConfig {
  soundEnabled: boolean;
  errorSoundPath: string;
  startSoundPath: string;
}

export class SoundPlayer {
  readonly library = new Map([
    ['start', this.initAudio(this.config.startSoundPath)],
    ['error', this.initAudio(this.config.errorSoundPath)],
  ]);

  constructor(private config: SoundPlayerConfig) {}

  update({ startSoundPath, errorSoundPath }: SoundPlayerConfig) {
    if (this.config.startSoundPath !== startSoundPath) {
      this.library.set('start', this.initAudio(startSoundPath));
      this.config.startSoundPath = startSoundPath;
    }

    if (this.config.errorSoundPath !== errorSoundPath) {
      this.library.set('error', this.initAudio(errorSoundPath));
      this.config.errorSoundPath = errorSoundPath;
    }
  }

  play(id: 'start' | 'error') {
    if (!this.library.has(id)) {
      throw new Error(`Provided id: ${id} is invalid`);
    }

    const audio = this.library.get(id);

    if (!audio) return;

    return audio.play();
  }

  private initAudio(path: string) {
    return path ? new Audio(path) : null;
  }
}
