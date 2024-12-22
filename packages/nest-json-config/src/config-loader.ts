import { createReadStream } from "node:fs";
import { json } from "node:stream/consumers";
import deepmerge from "deepmerge";

class EnvConfigLoader {
  private static readonly DEFAULT_ENVVAR = "NEST_CONFIG_PATHS";

  constructor(private readonly envvarName = EnvConfigLoader.DEFAULT_ENVVAR) {}

  private get env(): string | undefined {
    return process.env[this.envvarName];
  }

  isAvailable(): boolean {
    return typeof this.env === "string";
  }

  load(): string[] {
    return this.env?.split(",") ?? [];
  }
}

class CliConfigLoader {
  isAvailable(): boolean {
    return this.argvIndex !== -1;
  }

  private get argvIndex(): number {
    return process.argv.findIndex((arg) => arg.includes("--config"));
  }

  load(): string[] {
    const idx = this.argvIndex;

    const arg = process.argv[idx];
    if (arg.includes("=")) {
      return arg.split("=").at(1)?.split(",") ?? [];
    } else if (
      process.argv[idx + 1] &&
      !process.argv[idx + 1].startsWith("-")
    ) {
      return process.argv[idx + 1].split(",");
    }

    return [];
  }
}

class ConfigLoader {
  constructor(
    private readonly cli: CliConfigLoader,
    private readonly env: EnvConfigLoader,
  ) {}

  async load(): Promise<object> {
    let paths: string[] = [];
    if (this.cli.isAvailable()) {
      paths.push(...this.cli.load());
    }

    if (this.env.isAvailable()) {
      paths.push(...this.env.load());
    }

    let config: object = {};
    for (const path of paths) {
      config = deepmerge(config, await this.loadJson(path));
    }

    return config;
  }

  loadJson(filePath: string): Promise<object> {
    return json(createReadStream(filePath)) as Promise<object>;
  }
}

export function load(options: {
  envvarName: string | undefined;
}): Promise<object> {
  return new ConfigLoader(
    new CliConfigLoader(),
    new EnvConfigLoader(options.envvarName),
  ).load();
}
