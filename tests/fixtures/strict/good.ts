type Opt = { title?: string };
export function greet(name: string, opt?: Opt) {
  // exactOptionalPropertyTypes: opt?.title is string | undefined, not string
  const label = opt?.title ? `${opt.title}: ` : "";
  return `${label}Hello, ${name}`;
}