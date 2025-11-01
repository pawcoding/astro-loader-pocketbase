const branch = process.env.GITHUB_REF_NAME;
const customTag = process.env.CUSTOM_TAG;

const assetsToUpdate = ["package.json", "package-lock.json"];
if (branch === "master") {
  assetsToUpdate.push("CHANGELOG.md");
}

// Build branches array dynamically
const branches = [
  "master",
  { name: "next", channel: "next", prerelease: true }
];

// If custom tag is provided (manual trigger), add it as a prerelease branch
if (customTag) {
  branches.push({
    name: branch,
    channel: customTag,
    prerelease: true
  });
}

// Build plugins array
const plugins = [
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
        commitsSort: ["subject", "scope"]
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
  ]
];

// Only add GitHub plugin if not using custom tag
if (!customTag) {
  plugins.push([
    "@semantic-release/github",
    {
      successCommentCondition:
        '<% return issue.pull_request || !nextRelease.channel || !issue.labels.some(label => label.name === "released on @next"); %>'
    }
  ]);
}

const config = {
  branches: branches,
  plugins: plugins
};

module.exports = config;
