export type Command = () => void;

export class CommandManager<T> {
  private readonly commands = new Map<T, Command>();

  register(id: T, command: Command) {
    if (this.commands.has(id)) {
      throw new Error(`Command with id: "${id}" alredy exist!`);
    }

    this.commands.set(id, command);

    return this;
  }

  get(id: T) {
    return this.commands.get(id);
  }

  dispose() {
    this.commands.clear();
  }
}
