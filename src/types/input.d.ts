declare module 'input' {
  const input: {
    (
      msg?: string,
      options?: { default?: string; delimiter?: string }
    ): Promise<string>;
    text(msg?: string): Promise<string>;
  };
  export default input;
}
