// No external deps; just ANSI for colors.
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const gray = (s) => `\x1b[90m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

export class Runner {
  constructor(title = 'Tests') {
    this.title = title;
    this.total = 0;
    this.passed = 0;
    this.failed = 0;
    this.sections = [];
  }
  
  section(name) {
    const sec = { name, items: [] };
    this.sections.push(sec);
    console.log(`\n${bold(name)}`);
    return {
      pass: (label) => {
        this.total++;
        this.passed++;
        sec.items.push({ label, ok: true });
        console.log(`  ${green('✔')} ${label}`);
      },
      fail: (label, err) => {
        this.total++;
        this.failed++;
        sec.items.push({ label, ok: false, err });
        console.log(`  ${red('✖')} ${label}${err ? gray(` — ${String(err).split('\n')[0]}`) : ''}`);
      },
      skip: (label, why = '') => {
        console.log(`  ${gray('•')} ${label}${why ? gray(` — ${why}`) : ''}`);
      },
    };
  }
  
  summary() {
    console.log(
      `\n${bold(this.title)} summary: ` +
        `${this.passed}/${this.total} passed, ${this.failed} failed`
    );
    return { total: this.total, passed: this.passed, failed: this.failed };
  }
}