const fs = require("fs");
const path = require("path");
const {
  transformCommit
} = require("./.semantic-release/utils/transform-commit");

const branch = process.env.GITHUB_REF_NAME;

const assetsToUpdate = ["package.json", "package-lock.json"];
if (branch === "master") {
  assetsToUpdate.push("CHANGELOG.md");
}

const config = {
  branches: ["master", { name: "next", channel: "next", prerelease: true }],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          { type: "docs", scope: "README", release: "patch" },
          { type: "build", scope: "deps", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "style", release: "patch" }
        ],
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"]
        }
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular",
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"]
        },
        writerOpts: {
          commitsSort: ["subject", "scope"],
          groupBy: "type",
          commitGroupsSort: "title",
          noteGroupsSort: "title",
          mainTemplate: fs.readFileSync(
            path.join(__dirname, ".semantic-release/templates/template.hbs"),
            "utf-8"
          ),
          headerPartial: fs.readFileSync(
            path.join(__dirname, ".semantic-release/templates/header.hbs"),
            "utf-8"
          ),
          commitPartial: fs.readFileSync(
            path.join(__dirname, ".semantic-release/templates/commit.hbs"),
            "utf-8"
          ),
          footerPartial: fs.readFileSync(
            path.join(__dirname, ".semantic-release/templates/footer.hbs"),
            "utf-8"
          ),
          transform: transformCommit
        }
      }
    ],
    "@semantic-release/changelog",
    [
      "@semantic-release/npm",
      {
        npmPublish: true
      }
    ],
    [
      "@semantic-release/git",
      {
        assets: assetsToUpdate
      }
    ],
    [
      "@semantic-release/github",
      {
        successCommentCondition:
          '<% return issue.pull_request || !nextRelease.channel || !issue.labels.some(label => label.name === "released on @next"); %>',
        successComment: `<% if (nextRelease.channel) { %>:tada: This <%= issue.pull_request ? 'PR' : 'issue' %> is included in version <%= nextRelease.version %> which is now available for testing! :test_tube:

📦 **NPM:** [\`<%= package.name %>@<%= nextRelease.version %>\`](https://www.npmjs.com/package/<%= package.name %>/v/<%= nextRelease.version %>)
📖 **GitHub Release:** [<%= nextRelease.version %>](<%= releases[0].url %>)

<%= issue.pull_request ? '@' + issue.pull_request.user.login + ' Thank you for your contribution!' : '@' + issue.user.login + ' Can you check if everything works as expected in your project with this new version? Any feedback is welcome.' %>

<small>This change will be included in the next regular release.</small><% } else { %>:tada: This <%= issue.pull_request ? 'PR' : 'issue' %> is included in version <%= nextRelease.version %> which is now available! :rocket:

📦 **NPM:** [\`<%= package.name %>@<%= nextRelease.version %>\`](https://www.npmjs.com/package/<%= package.name %>/v/<%= nextRelease.version %>)
📖 **GitHub Release:** [<%= nextRelease.version %>](<%= releases[0].url %>)<%= issue.pull_request ? '\\n\\nThank you for your contribution!' : '' %><% } %>`
      }
    ]
  ]
};

module.exports = config;
