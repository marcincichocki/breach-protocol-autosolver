declare module 'sound-play' {
  export function play(absolutePath: string, volume?: number): Promise<void>;
}
