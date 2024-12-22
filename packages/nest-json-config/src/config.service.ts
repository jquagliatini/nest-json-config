import { Inject, Injectable } from "@nestjs/common";
import { BasicConfig, Paths, PathType } from "./types";
import { LOADED_CONFIG } from "./constants";

@Injectable()
export class ConfigService<Config extends BasicConfig> {
  constructor(@Inject(LOADED_CONFIG) private readonly config: Config) {}

  get<Path extends Paths<Config>>(key: Path): PathType<Config, Path> {
    const paths = (key as string).trim().split(".");
    let p = paths.shift();

    let out: BasicConfig = this.config;
    while (p && p in out) {
      out = out[p] as BasicConfig;
      p = paths.shift();
    }

    if (paths.length > 0) {
      throw new Error(`Could not find path ${p}`);
    }

    return out as PathType<Config, Path>;
  }
}
