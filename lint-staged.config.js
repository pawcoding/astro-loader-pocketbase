/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  "!(*.ts|*.ts.snap)": "prettier --write",
  "*.ts": ["oxlint", "prettier --write"]
};
