import { AppSettings } from '../common';
import { activeDisplayIdOption } from './active-display-id';
import { autoUpdateOption } from './auto-update';
import { delayOption } from './delay';

export class BreachProtocolOption<T> {
  description: string;

  defaultValue: T = null;

  constructor(public readonly name: keyof AppSettings) {}

  withDescription(description: string) {
    this.description = description;

    return this;
  }

  withDefaultValue(defaultValue: T) {
    this.defaultValue = defaultValue;

    return this;
  }
}

export class BreachProtocolSettings {
  private readonly options = new Map<
    keyof AppSettings,
    BreachProtocolOption<any>
  >();

  private static instance: BreachProtocolSettings;

  private constructor() {}

  static getInstance() {
    if (!BreachProtocolSettings.instance) {
      BreachProtocolSettings.instance = new BreachProtocolSettings();
    }

    return BreachProtocolSettings.instance;
  }

  getDefaults() {
    return this.mapOptions((o) => o.defaultValue) as AppSettings;
  }

  getDescriptions() {
    return this.mapOptions((o) => o.description) as Record<
      keyof AppSettings,
      string
    >;
  }

  addOption<T>(option: BreachProtocolOption<T>) {
    this.options.set(option.name, option);

    return this;
  }

  private mapOptions<T>(mapFn: (option: BreachProtocolOption<any>) => T) {
    const entries = Array.from(
      this.options,
      ([key, option]) => [key, mapFn(option)] as [keyof AppSettings, T]
    );

    return Object.fromEntries(entries);
  }
}

export const settings = BreachProtocolSettings.getInstance()
  .addOption(activeDisplayIdOption)
  .addOption(autoUpdateOption)
  .addOption(delayOption);
