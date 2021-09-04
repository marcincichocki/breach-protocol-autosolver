export interface SoundPlayerConfig {
  soundEnabled: boolean;
  errorSoundPath: string;
  startSoundPath: string;
}

interface SoundPlayer {
  play(id: string): Promise<void>;
}

export class BreachProtocolSoundPlayer implements SoundPlayer {
  private readonly library = new Map([
    ['start', this.initAudio(this.config.startSoundPath)],
    ['error', this.initAudio(this.config.errorSoundPath)],
  ]);

  constructor(private config: SoundPlayerConfig) {}

  update({ startSoundPath, errorSoundPath, soundEnabled }: SoundPlayerConfig) {
    if (this.config.startSoundPath !== startSoundPath) {
      this.library.set('start', this.initAudio(startSoundPath));
      this.config.startSoundPath = startSoundPath;
    }

    if (this.config.errorSoundPath !== errorSoundPath) {
      this.library.set('error', this.initAudio(errorSoundPath));
      this.config.errorSoundPath = errorSoundPath;
    }

    if (this.config.soundEnabled !== soundEnabled) {
      this.config.soundEnabled === soundEnabled;
    }
  }

  play(id: 'start' | 'error') {
    if (!this.config.soundEnabled) return;

    const audio = this.library.get(id);

    if (!audio) return;

    return audio.play();
  }

  private initAudio(path: string) {
    return path ? new Audio(path) : null;
  }
}
