import { Accelerator, globalShortcut } from 'electron';
import isAccelerator from 'electron-is-accelerator';
import { Command, CommandManager } from './command-manager';

class KeyBind {
  private active = false;

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

  private active = false;

  constructor(private commandManager: CommandManager<T>) {}

  /** Register new or update existing command. */
  register(id: T, accelerator: Accelerator) {
    const command = this.commandManager.get(id);
    const keyBind = new KeyBind(accelerator, command);

    if (this.active) {
      const oldKeyBind = this.registry.get(id);

      if (oldKeyBind) {
        oldKeyBind.unregister();
      }

      keyBind.register();
    }

    this.registry.set(id, keyBind);

    return this;
  }

  /** Unregister command and remove it from the registry. */
  unregister(id: T) {
    if (!this.registry.has(id)) {
      throw new Error(`Key bind with id "${id}" does not exist!`);
    }

    this.registry.get(id).unregister();
    this.registry.delete(id);
  }

  /** Enable every {@link Accelerator}. */
  enable() {
    this.registry.forEach((k) => k.register());
    this.active = true;
  }

  /** Disable every {@link Accelerator}. */
  disable() {
    this.registry.forEach((k) => k.unregister());
    this.active = false;
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
