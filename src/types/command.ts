export class RawCommand {
  readonly name: string;
  readonly params: Record<string, string>;

  constructor(name: string, params: Record<string, string>) {
    this.name = name;
    this.params = params;
  }
}
