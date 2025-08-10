const fs = require("fs");
const path = require("path");

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
          transform: (commit, context) => {
            const issues = [];

            commit.notes.forEach((note) => {
              note.title = "BREAKING CHANGES";
            });

            // Group different commit types under appropriate categories
            if (commit.type === "feat") {
              commit.type = "Features";
            } else if (commit.type === "fix") {
              commit.type = "Bug Fixes";
            } else if (commit.type === "docs") {
              commit.type = "Documentation";
            } else if (
              ["style", "refactor", "test", "build", "ci", "chore"].includes(
                commit.type
              )
            ) {
              commit.type = "Internals";
            } else if (commit.type === "perf") {
              commit.type = "Performance Improvements";
            } else if (commit.revert) {
              commit.type = "Reverts";
            } else {
              return;
            }

            if (commit.scope === "*") {
              commit.scope = "";
            }

            if (typeof commit.hash === "string") {
              commit.shortHash = commit.hash.substring(0, 7);
            }

            if (typeof commit.subject === "string") {
              let url = context.repository
                ? `${context.host}/${context.owner}/${context.repository}`
                : context.repoUrl;
              if (url) {
                url = `${url}/issues/`;
                // Issue URLs.
                commit.subject = commit.subject.replace(
                  /#([0-9]+)/g,
                  (_, issue) => {
                    issues.push(issue);
                    return `[#${issue}](${url}${issue})`;
                  }
                );
              }
              if (context.host) {
                // User URLs.
                commit.subject = commit.subject.replace(
                  /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
                  (_, username) => {
                    if (username.includes("/")) {
                      return `@${username}`;
                    }

                    return `[@${username}](${context.host}/${username})`;
                  }
                );
              }
            }

            // remove references that already appear in the subject
            commit.references = commit.references.filter((reference) => {
              if (issues.indexOf(reference.issue) === -1) {
                return true;
              }

              return false;
            });

            return commit;
          }
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
        successComment: `<% if (nextRelease.channel) { %>:tada: This <%= issue.pull_request ? 'PR' : 'issue' %> is included in version <%= nextRelease.version %> which is now available for testing! :rocket:

📦 **NPM:** [\`<%= package.name %>@<%= nextRelease.version %>\`](https://www.npmjs.com/package/<%= package.name %>/v/<%= nextRelease.version %>)
📖 **GitHub Release:** [<%= nextRelease.version %>](<%= releases[0].url %>)

<%= issue.pull_request ? '@' + issue.pull_request.user.login : '@' + issue.user.login %> <%= issue.pull_request ? 'Thank you for your contribution! This PR' : 'Would you mind testing this fix in your project and letting us know if it works as expected? We\\'d love your feedback!' %>

This change will be included in the next regular release.<% } else { %>:tada: This <%= issue.pull_request ? 'PR' : 'issue' %> is included in version <%= nextRelease.version %> which is now available! :rocket:

📦 **NPM:** [\`<%= package.name %>@<%= nextRelease.version %>\`](https://www.npmjs.com/package/<%= package.name %>/v/<%= nextRelease.version %>)
📖 **GitHub Release:** [<%= nextRelease.version %>](<%= releases[0].url %>)<%= issue.pull_request ? '\\n\\nThank you for your contribution!' : '' %><% } %>`,
        releasedLabels: ["released on @<%= nextRelease.channel || 'latest' %>"],
        addReleases: "bottom"
      }
    ]
  ]
};

module.exports = config;
