import { Accelerator, globalShortcut } from 'electron';
import isAccelerator from 'electron-is-accelerator';
import { Command, CommandManager } from './command-manager';

export class KeyBind {
  private active = false;

  get isActive() {
    return this.active;
  }

  constructor(
    public readonly accelerator: Accelerator,
    public readonly callback: Command
  ) {}

  register() {
    if (this.active) return;

    this.active = globalShortcut.register(this.accelerator, this.callback);

    if (!this.active) {
      throw new Error(`Couldn't register "${this.accelerator}" accelerator`);
    }

    return this.active;
  }

  unregister() {
    if (!this.active) return;

    globalShortcut.unregister(this.accelerator);

    this.active = false;
  }
}

/** Manage global key binds. */
export class KeyBindManager<T> {
  private readonly registry = new Map<T, KeyBind>();

  constructor(private commandManager: CommandManager<T>) {}

  register(id: T, accelerator: Accelerator) {
    if (this.registry.has(id)) {
      throw new Error(`Id "${id}" is alredy specified!`);
    }

    const command = this.commandManager.get(id);
    const keyBind = new KeyBind(accelerator, command);

    this.registry.set(id, keyBind);

    return this;
  }

  /** Set new accelerator for given key bind id. */
  changeAcceleratorFor(id: T, accelerator: Accelerator) {
    if (!this.registry.has(id)) {
      throw new Error(`Key bind with id: "${id}" does not exist!`);
    }

    const oldKeyBind = this.registry.get(id);
    const command = this.commandManager.get(id);
    const keyBind = new KeyBind(accelerator, command);

    if (oldKeyBind.isActive) {
      oldKeyBind.unregister();
      keyBind.register();
    }

    this.registry.set(id, keyBind);
  }

  enable() {
    this.registry.forEach((k) => k.register());
  }

  disable() {
    this.registry.forEach((k) => k.unregister());
  }

  dispose() {
    this.disable();
    this.registry.clear();
  }

  /** Check if given {@link Accelerator} is valid. */
  isValid(input: string) {
    const isValidAccelerator = isAccelerator(input);
    const isUnique = this.isUniqueAccelerator(input);

    return isValidAccelerator && isUnique;
  }

  private isUniqueAccelerator(input: Accelerator) {
    const a = this.normalizeAccelerator(input);

    for (const { accelerator } of this.registry.values()) {
      const b = this.normalizeAccelerator(accelerator);

      if (a === b) {
        return false;
      }
    }

    return true;
  }

  private normalizeAccelerator(input: Accelerator): Accelerator {
    return input.split('+').sort().join('+');
  }
}
