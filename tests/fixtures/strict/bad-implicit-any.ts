// Should fail with TS7006 (parameter implicitly has 'any')
// and/or TS7031 (binding element implicitly has 'any')
export function bad(a, { b }) {
  return a ?? b;
}
