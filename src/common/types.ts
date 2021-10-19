// Common daemons.
export const DAEMON_DATAMINE_V1 = 'DAEMON_DATAMINE_V1';
export const DAEMON_DATAMINE_V2 = 'DAEMON_DATAMINE_V2';
export const DAEMON_DATAMINE_V3 = 'DAEMON_DATAMINE_V3';
export const DAEMON_ICEPICK = 'DAEMON_ICEPICK';
// Perk daemons.
export const DAEMON_MASS_VULNERABILITY = 'DAEMON_MASS_VULNERABILITY';
export const DAEMON_CAMERA_SHUTDOWN = 'DAEMON_CAMERA_SHUTDOWN';
export const DAEMON_FRIENDLY_TURRETS = 'DAEMON_FRIENDLY_TURRETS';
export const DAEMON_TURRET_SHUTDOWN = 'DAEMON_TURRET_SHUTDOWN';
// Passive from legendary daemons.
export const DAEMON_OPTICS_JAMMER = 'DAEMON_OPTICS_JAMMER';
export const DAEMON_WEAPONS_JAMMER = 'DAEMON_WEAPONS_JAMMER';
// Quest or special daemons.
export const DAEMON_DATAMINE_COPY_MALWARE = 'DAEMON_DATAMINE_COPY_MALWARE';
export const DAEMON_NEUTRALIZE_MALWARE = 'DAEMON_NEUTRALIZE_MALWARE';
export const DAEMON_GAIN_ACCESS = 'DAEMON_GAIN_ACCESS';
export const DAEMON_DATAMINE_CRAFTING_SPECS = 'DAEMON_DATAMINE_CRAFTING_SPECS';
/** Special type for daemons that couldn't be recognized. */
export const DAEMON_UNKNOWN = 'DAEMON_UNKNOWN';

export type DaemonId =
  | typeof DAEMON_DATAMINE_V1
  | typeof DAEMON_DATAMINE_V2
  | typeof DAEMON_DATAMINE_V3
  | typeof DAEMON_ICEPICK
  | typeof DAEMON_MASS_VULNERABILITY
  | typeof DAEMON_CAMERA_SHUTDOWN
  | typeof DAEMON_FRIENDLY_TURRETS
  | typeof DAEMON_TURRET_SHUTDOWN
  | typeof DAEMON_OPTICS_JAMMER
  | typeof DAEMON_WEAPONS_JAMMER
  | typeof DAEMON_DATAMINE_COPY_MALWARE
  | typeof DAEMON_NEUTRALIZE_MALWARE
  | typeof DAEMON_GAIN_ACCESS
  | typeof DAEMON_DATAMINE_CRAFTING_SPECS
  | typeof DAEMON_UNKNOWN;

interface DaemonType {
  id: DaemonId;
  value: string;
}

interface DaemonLangData {
  thresholds?: any;
  daemons: DaemonType[];
}

export const eng: DaemonLangData = {
  daemons: [
    { id: DAEMON_DATAMINE_V1, value: 'DATAMINE_V1' },
    { id: DAEMON_DATAMINE_V2, value: 'DATAMINE_V2' },
    { id: DAEMON_DATAMINE_V3, value: 'DATAMINE_V3' },
    { id: DAEMON_ICEPICK, value: 'ICEPICK' },
    { id: DAEMON_MASS_VULNERABILITY, value: 'MASS VULNERABILITY' },
    { id: DAEMON_CAMERA_SHUTDOWN, value: 'CAMERA SHUTDOWN' },
    { id: DAEMON_FRIENDLY_TURRETS, value: 'FRIENDLY TURRETS' },
    { id: DAEMON_TURRET_SHUTDOWN, value: 'TURRET SHUTDOWN' },
    { id: DAEMON_OPTICS_JAMMER, value: 'OPTICS JAMMER' },
    { id: DAEMON_WEAPONS_JAMMER, value: 'WEAPONS JAMMER' },
    { id: DAEMON_DATAMINE_COPY_MALWARE, value: 'DATAMINE: COPY MALWARE' },
    { id: DAEMON_NEUTRALIZE_MALWARE, value: 'NEUTRALIZE MALWARE' },
    { id: DAEMON_GAIN_ACCESS, value: 'GAIN ACCESS' },
    { id: DAEMON_DATAMINE_CRAFTING_SPECS, value: 'DATAMINE: CRAFTING SPECS' },
  ],
};

const pol: DaemonLangData = {
  daemons: [
    { id: DAEMON_DATAMINE_V1, value: 'EKSPLORACJA_DANYCH_V1' },
    { id: DAEMON_DATAMINE_V2, value: 'EKSPLORACJA_DANYCH_V2' },
    { id: DAEMON_DATAMINE_V3, value: 'EKSPLORACJA_DANYCH_V3' },
    { id: DAEMON_ICEPICK, value: 'LODOŁAMACZ' },
    { id: DAEMON_MASS_VULNERABILITY, value: 'ZBIOROWE ODSŁONIĘCIE' },
    { id: DAEMON_CAMERA_SHUTDOWN, value: 'WYŁĄCZENIE KAMERY' },
    { id: DAEMON_FRIENDLY_TURRETS, value: 'PRZYJAZNE WIEŻYCZKI' },
    { id: DAEMON_TURRET_SHUTDOWN, value: 'WYŁĄCZENIE WIEŻYCZKI' },
    { id: DAEMON_OPTICS_JAMMER, value: 'BLOKER OPTYCZNY' },
    { id: DAEMON_WEAPONS_JAMMER, value: 'BLOKER SPUSTU' },
    {
      id: DAEMON_DATAMINE_COPY_MALWARE,
      value: 'EKSPLORACJA DANYCH: KOPIA WROGIEGO OPROGRAMOWANIA',
    },
    {
      id: DAEMON_NEUTRALIZE_MALWARE,
      value: 'ZNEUTRALIZUJ WROGIE OPROGRAMOWANIE',
    },
    { id: DAEMON_GAIN_ACCESS, value: 'UZYSKAJ DOSTĘP' },
    {
      id: DAEMON_DATAMINE_CRAFTING_SPECS,
      value: 'EKSPLORACJA DANYCH: SCHEMATY WYTWARZANIA',
    },
  ],
};

const rus: DaemonLangData = {
  daemons: [
    { id: DAEMON_DATAMINE_V1, value: 'ДОБЫЧА_ДАННЫХ_1' },
    { id: DAEMON_DATAMINE_V2, value: 'ДОБЫЧА_ДАННЫХ_2' },
    { id: DAEMON_DATAMINE_V3, value: 'ДОБЫЧА_ДАННЫХ_3' },
    { id: DAEMON_ICEPICK, value: 'ОТПРАВИТЬ «ЛЕДОКОЛ»' },
    { id: DAEMON_MASS_VULNERABILITY, value: 'ВЫЗВАТЬ МАССОВУЮ УЯЗВИМОСТЬ' },
    { id: DAEMON_CAMERA_SHUTDOWN, value: 'ОТКЛЮЧИТЬ КАМЕРУ' },
    { id: DAEMON_FRIENDLY_TURRETS, value: 'СДЕЛАТЬ ТУРЕЛИ ДРУЖЕСТВЕННЫМИ' },
    { id: DAEMON_TURRET_SHUTDOWN, value: 'ОТКЛЮЧИТЬ ТУРЕЛЬ' },
    { id: DAEMON_OPTICS_JAMMER, value: 'БЛОКИРОВАТЬ ОПТИКУ' },
    { id: DAEMON_WEAPONS_JAMMER, value: 'БЛОКИРОВАТЬ ОРУЖИЕ' },
    { id: DAEMON_DATAMINE_COPY_MALWARE, value: 'ДОБЫЧА ДАННЫХ: КОПИИ ВИРУСОВ' },
    { id: DAEMON_NEUTRALIZE_MALWARE, value: 'ОБЕЗВРЕДИТЬ ВИРУС' },
    { id: DAEMON_GAIN_ACCESS, value: 'ПОЛУЧИТЬ ДОСТУП' },
    {
      id: DAEMON_DATAMINE_CRAFTING_SPECS,
      value: 'ДОБЫЧА ДАННЫХ: ДОКУМЕНТАЦИЯ',
    },
  ],
};

export const langData = {
  eng,
  pol,
  rus,
};

export type BreachProtocolLanguage = keyof typeof langData;
