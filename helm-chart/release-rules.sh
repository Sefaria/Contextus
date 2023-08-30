#!/bin/bash

cat << EOF > helm-chart/.releaserc
tagFormat: helm-chart-\${version}
plugins:
  - - "@semantic-release/commit-analyzer"
    - presetConfig:
        - {"type": "feat", "hidden": true}
        - {"type": "fix", "hidden": true"}
        - {"type": "chore", "hidden": true}
        - {"type": "docs", "hidden": true}
        - {"type": "style", "hidden": true}
        - {"type": "refactor", "hidden": true}
        - {"type": "perf", "hidden": true}
        - {"type": "test", "hidden": true}
        - {"type": "static", "hidden": true}
        - {"type": "helm", "section": "Helm Chart Changes"}
      releaseRules:
        - {"type": "helm", release: patch}
      parserOpts:
        noteKeywords:
          - MAJOR RELEASE
  - "@semantic-release/release-notes-generator"
  - - "@semantic-release/github"
    - "successComment": false
EOF
export branch=$(git branch --show-current)
export channel=$(echo $branch | awk '{print tolower($0)}' | sed 's|.*/\([^/]*\)/.*|\1|; t; s|.*|\0|' | sed 's/[^a-z0-9\.\-]//g')
if [[ $branch != "master" ]]; then
cat << EOF >> helm-chart/.releaserc
branches: [
    {"name": "master"},
    {"name": "${branch}", "prerelease": "$channel"}
  ]
EOF
else
cat << EOF >> helm-chart/.releaserc
branches: [
    {"name": "master"}
  ]
EOF
fi
