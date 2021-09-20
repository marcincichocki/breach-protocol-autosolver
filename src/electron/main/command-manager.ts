export type Command = () => void;

export class CommandManager {
  private readonly commands = new Map<string, Command>();

  register(id: string, command: Command) {
    if (this.commands.has(id)) {
      throw new Error(`Command with id: "${id}" alredy exist!`);
    }

    this.commands.set(id, command);

    return this;
  }

  get(id: string) {
    return this.commands.get(id);
  }

  dispose() {
    this.commands.clear();
  }
}
