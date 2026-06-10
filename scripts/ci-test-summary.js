/**
 * Gera estatísticas dos testes (CI local ou GitHub Actions).
 * Lê test-results/junit.xml e grava test-results/summary.json
 */
const fs = require('fs');
const path = require('path');

const resultsDir = path.join(__dirname, '..', 'test-results');
const junitPath = path.join(resultsDir, 'junit.xml');
const summaryPath = path.join(resultsDir, 'summary.json');

function parseJUnit(xml) {
  const suites = [...xml.matchAll(/<testsuite[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"[^>]*time="([^"]*)"/g)];
  let total = 0;
  let failures = 0;
  let errors = 0;
  let time = 0;

  for (const m of suites) {
    total += parseInt(m[1], 10);
    failures += parseInt(m[2], 10);
    errors += parseInt(m[3], 10);
    time += parseFloat(m[4]) || 0;
  }

  if (suites.length === 0) {
    const tests = (xml.match(/<testcase /g) || []).length;
    const failTags = (xml.match(/<failure/g) || []).length;
    const errTags = (xml.match(/<error/g) || []).length;
    return {
      total: tests,
      passed: tests - failTags - errTags,
      failed: failTags + errTags,
      errors: errTags,
      durationSec: 0,
    };
  }

  const failed = failures + errors;
  return {
    total,
    passed: total - failed,
    failed,
    errors,
    durationSec: Math.round(time * 1000) / 1000,
  };
}

function main() {
  if (!fs.existsSync(junitPath)) {
    console.log('Arquivo junit.xml não encontrado — pulando resumo.');
    process.exit(0);
  }

  const xml = fs.readFileSync(junitPath, 'utf8');
  const stats = parseJUnit(xml);
  const expected = 20;
  const summary = {
    generatedAt: new Date().toISOString(),
    expectedTests: expected,
    ...stats,
    successRate:
      stats.total > 0
        ? `${Math.round((stats.passed / stats.total) * 100)}%`
        : '0%',
    allPassed: stats.failed === 0 && stats.total >= expected,
  };

  fs.mkdirSync(resultsDir, { recursive: true });
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  const lines = [
    '## Estatísticas dos testes (CI)',
    '',
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| Total executados | ${stats.total} |`,
    `| Aprovados | ${stats.passed} |`,
    `| Falhas | ${stats.failed} |`,
    `| Esperados (trabalho) | ${expected} |`,
    `| Taxa de sucesso | ${summary.successRate} |`,
    `| Duração (s) | ${stats.durationSec} |`,
    '',
    summary.allPassed
      ? '**Resultado: todos os testes passaram.**'
      : '**Resultado: há falhas — verifique o log.**',
  ];

  const text = lines.join('\n');
  console.log('\n' + text + '\n');

  const stepSummary = process.env.GITHUB_STEP_SUMMARY;
  if (stepSummary) {
    fs.appendFileSync(stepSummary, text + '\n');
  }
}

main();
