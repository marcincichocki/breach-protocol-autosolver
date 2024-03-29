import { DaemonId } from './common';
import {
  DAEMON_ADVANCED_DATAMINE,
  DAEMON_BASIC_DATAMINE,
  DAEMON_CAMERA_SHUTDOWN,
  DAEMON_DATAMINE_COPY_MALWARE,
  DAEMON_DATAMINE_CRAFTING_SPECS,
  DAEMON_DATAMINE_V1,
  DAEMON_DATAMINE_V2,
  DAEMON_DATAMINE_V3,
  DAEMON_EXPERT_DATAMINE,
  DAEMON_FRIENDLY_TURRETS,
  DAEMON_GAIN_ACCESS,
  DAEMON_ICEPICK,
  DAEMON_MASS_VULNERABILITY,
  DAEMON_NEUTRALIZE_MALWARE,
  DAEMON_OPTICS_JAMMER,
  DAEMON_TURRET_SHUTDOWN,
  DAEMON_WEAPONS_JAMMER,
} from './daemons';

export const LEGACY_DAEMONS = new Set<DaemonId>([
  DAEMON_DATAMINE_V1,
  DAEMON_DATAMINE_V2,
  DAEMON_DATAMINE_V3,
  DAEMON_ICEPICK,
  DAEMON_MASS_VULNERABILITY,
  DAEMON_CAMERA_SHUTDOWN,
  DAEMON_FRIENDLY_TURRETS,
  DAEMON_TURRET_SHUTDOWN,
  DAEMON_OPTICS_JAMMER,
  DAEMON_WEAPONS_JAMMER,
  DAEMON_DATAMINE_COPY_MALWARE,
  DAEMON_NEUTRALIZE_MALWARE,
  DAEMON_GAIN_ACCESS,
  DAEMON_DATAMINE_CRAFTING_SPECS,
]);

export const DAEMONS = new Set<DaemonId>([
  DAEMON_DATAMINE_COPY_MALWARE,
  DAEMON_NEUTRALIZE_MALWARE,
  DAEMON_GAIN_ACCESS,
  DAEMON_DATAMINE_CRAFTING_SPECS,
  DAEMON_BASIC_DATAMINE,
  DAEMON_ADVANCED_DATAMINE,
  DAEMON_EXPERT_DATAMINE,
]);
