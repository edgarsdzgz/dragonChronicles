// should fail eslint/prettier: unused var, double quotes, missing semi
const Bad = (x:any)=>{ const y=1 ; return x + y }
export { Bad }