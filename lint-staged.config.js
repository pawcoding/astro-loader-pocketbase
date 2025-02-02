/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  "!(*.ts)": "prettier --write",
  "*.ts": ["eslint --fix", "prettier --write"]
};
