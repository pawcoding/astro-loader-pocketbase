const branch = process.env.GITHUB_REF_NAME;

const assetsToUpdate = ["package.json", "package-lock.json"];
if (branch === "master") {
  assetsToUpdate.push("CHANGELOG.md");
}

// Function to detect preview package pattern in commit messages
function getPreviewTagFromCommits() {
  const { execSync } = require("child_process");
  try {
    // Get the latest commit message
    const latestCommit = execSync("git log -1 --pretty=%B", {
      encoding: "utf8"
    }).trim();
    const match = latestCommit.match(/\[img:([^\]]+)\]/);
    return match ? match[1] : null;
  } catch (error) {
    console.log(
      "Warning: Could not parse commit messages for preview tag detection"
    );
    return null;
  }
}

const previewTag = getPreviewTagFromCommits();
const isPreviewRelease = !!previewTag;

// Debug logging
if (isPreviewRelease) {
  console.log(`🎭 Preview release detected with tag: ${previewTag}`);
  console.log(
    "📦 Will publish to npm only (no GitHub release or repository changes)"
  );
} else {
  console.log("🚀 Standard release detected");
}

// Configure branches dynamically based on whether this is a preview release
const branches = [
  "master",
  { name: "next", channel: "next", prerelease: true }
];
if (isPreviewRelease) {
  // Add dynamic channel for preview releases
  branches.push({ name: branch, channel: previewTag, prerelease: true });
}

// Configure plugins dynamically based on release type
const plugins = [
  [
    "@semantic-release/commit-analyzer",
    {
      preset: "angular",
      releaseRules: [
        { type: "docs", scope: "README", release: "patch" },
        { type: "build", scope: "deps", release: "patch" },
        { type: "refactor", release: "patch" },
        { type: "style", release: "patch" },
        // Custom rule for preview packages
        { message: "*[img:*]*", release: "patch" }
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
  // Always include npm plugin for publishing
  [
    "@semantic-release/npm",
    {
      npmPublish: true
    }
  ]
];

// Only add changelog, git, and github plugins for non-preview releases
if (!isPreviewRelease) {
  plugins.splice(2, 0, "@semantic-release/changelog"); // Insert after release-notes-generator
  plugins.push(
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
          '<% return issue.pull_request || !nextRelease.channel || !issue.labels.some(label => label.name === "released on @next"); %>'
      }
    ]
  );
}

const config = {
  branches: branches,
  plugins: plugins
};

module.exports = config;
