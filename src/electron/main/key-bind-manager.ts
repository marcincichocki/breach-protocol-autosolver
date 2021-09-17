import { Accelerator, globalShortcut } from 'electron';
import isAccelerator from 'electron-is-accelerator';

export class KeyBind {
  private active = false;

  get isActive() {
    return this.active;
  }

  constructor(
    public readonly accelerator: Accelerator,
    public readonly callback: () => void
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

export interface KeyBindConfig {
  keyBind: Accelerator;
  solveWithPriority1: Accelerator;
  solveWithPriority2: Accelerator;
  solveWithPriority3: Accelerator;
  solveWithPriority4: Accelerator;
  solveWithPriority5: Accelerator;
}

type KeyBindId = keyof KeyBindConfig;

/** Manage global key binds. */
export class KeyBindManager {
  private readonly registry = new Map<KeyBindId, KeyBind>();

  addKeyBind(id: KeyBindId, keyBind: KeyBind) {
    if (this.registry.has(id)) {
      throw new Error(`Id "${id}" is alredy specified!`);
    }

    this.registry.set(id, keyBind);

    return this;
  }

  /** Set new accelerator for given key bind id. */
  changeAcceleratorFor(id: KeyBindId, accelerator: Accelerator) {
    if (!this.registry.has(id)) {
      throw new Error(`Key bind with id: "${id}" does not exist!`);
    }

    const oldKeyBind = this.registry.get(id);
    const keyBind = new KeyBind(accelerator, oldKeyBind.callback);

    if (oldKeyBind.isActive) {
      oldKeyBind.unregister();
      keyBind.register();
    }

    this.registry.set(id, keyBind);
  }

  registerAll() {
    this.registry.forEach((k) => k.register());
  }

  unregisterAll() {
    this.registry.forEach((k) => k.unregister());
  }

  /** Check if given {@link Accelerator} is valid. */
  isValid(input: string) {
    const isValidAccelerator = isAccelerator(input);
    const isUnique = this.isUniqueAccelerator(input);

    return isValidAccelerator && isUnique;
  }

  private isUniqueAccelerator(accelerator: Accelerator) {
    // TODO: check if inverse accelerators work, for example Alt+1 and 1+Alt.
    for (const keyBind of this.registry.values()) {
      if (keyBind.accelerator === accelerator) {
        return false;
      }
    }

    return true;
  }
}
