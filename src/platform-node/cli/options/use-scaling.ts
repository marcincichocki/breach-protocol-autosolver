import { Option } from 'commander';

export interface UseScalingOption {
  useScaling: number;
}

const flags = '--use-scaling';
const description = 'Use this if you are running Cyberpunk 2077 via streaming.';

export const useScalingOption = new Option(flags, description).default(false);
