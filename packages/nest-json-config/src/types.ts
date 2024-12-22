export type BasicConfig = {
  [k: string]: string | string[] | number | number[] | BasicConfig;
};

type Concat<A extends string, B extends string = ""> = B extends ""
  ? A
  : `${B}.${A}`;

export type Paths<C extends BasicConfig, P extends string = ""> = {
  [K in Extract<keyof C, string>]:
    | Concat<K, P>
    | (C[K] extends BasicConfig ? Paths<C[K], Concat<K, P>> : never);
}[Extract<keyof C, string>];

export type PathType<C extends BasicConfig, P extends string> = P extends ""
  ? C
  : P extends `${infer A extends Extract<keyof C, string>}`
    ? C[A]
    : P extends `${infer A extends Extract<keyof C, string>}.${infer B}`
      ? C[A] extends BasicConfig
        ? PathType<C[A], B>
        : C[A]
      : never;
