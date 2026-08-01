/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  "!(*.ts)": "oxfmt --no-error-on-unmatched-pattern",
  "*.ts": ["oxlint", "oxfmt"]
};
