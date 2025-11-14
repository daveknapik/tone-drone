# Release Process

This document describes how to create releases for Tone Drone.

## Overview

Tone Drone uses a **hybrid workflow** that balances solo-developer convenience with proper versioning:

- **Daily development**: Merge to `main` → auto-deploys to GitHub Pages (no version bump needed)
- **Version milestones**: Create a git tag → triggers automated GitHub Release creation

This means you can work freely without versioning overhead, and only cut releases when you want to mark a milestone.

## Quick Release

When you're ready to mark a version milestone (e.g., after completing a feature or set of changes):

### 1. Update CHANGELOG.md

Move items from the `[Unreleased]` section (if you have one) to a new version section with today's date.

**Format** (see CLAUDE.md for complete formatting guidelines):

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added

- New feature descriptions
- More features

### Changed

- What changed
- More changes

### Fixed

- Bug fixes
- More fixes

---
```

**Critical**:
- Version header must be exactly `## [X.Y.Z] - YYYY-MM-DD`
- End the section with `---` on its own line
- This format is required for automated GitHub Release notes extraction

### 2. Bump Version in package.json

Use the npm version scripts (they won't create git tags, just update package.json):

```bash
npm run version:patch   # 1.0.0 → 1.0.1 (bug fixes)
npm run version:minor   # 1.0.0 → 1.1.0 (new features)
npm run version:major   # 1.0.0 → 2.0.0 (breaking changes)
```

Or manually edit `package.json` and set the version.

### 3. Commit and Tag

```bash
git add package.json CHANGELOG.md
git commit -m "chore: release vX.Y.Z"
git tag vX.Y.Z
git push && git push --tags
```

### 4. GitHub Release Created Automatically

The `.github/workflows/release.yml` workflow will:
- Detect the new tag
- Extract the changelog section for this version
- Create a GitHub Release with those notes

Check the [Releases page](https://github.com/daveknapik/tone-drone/releases) to verify.

## Daily Development (No Release)

For day-to-day work, **just merge to main**:

```bash
git checkout -b feature/new-thing
# ... make changes ...
git commit -m "feat: add new thing"
git push origin feature/new-thing
# ... merge PR to main ...
# ✨ Auto-deploys to production (no version bump needed)
```

The existing `.github/workflows/deploy.yml` workflow continues to deploy every push to `main`.

## Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **Major (X.0.0)**: Breaking changes, major feature overhauls
  - Example: Complete UI redesign, API changes
  - Use sparingly for solo projects

- **Minor (0.X.0)**: New features, significant improvements
  - Example: New effect, modulation system, preset features
  - Most feature releases should be minor bumps

- **Patch (0.0.X)**: Bug fixes, small improvements
  - Example: Fix audio clicks, improve layout on mobile
  - No new features, just fixes

## When to Cut Releases

There's no strict rule, but consider releasing when:

- **Multiple features are complete** - Bundle related changes into a cohesive release
- **Major milestone reached** - Like v1.0.0 for Modulation Matrix
- **Significant bug fixes** - If you've fixed important issues, document them in a release
- **Monthly cadence** - If you want regular snapshots of progress
- **When it feels right** - Trust your judgment on what's "release-worthy"

For a solo project, releases are mainly for:
1. Documentation (marking milestones)
2. User communication (what's new)
3. Historical reference (what changed when)

## Changelog Formatting

**IMPORTANT**: The automated release workflow extracts notes from CHANGELOG.md using a bash script. The format must be exact:

### Required Format

```markdown
## [X.Y.Z] - YYYY-MM-DD

Content goes here (markdown is fine)

---
```

### Rules

1. Version header: `## [X.Y.Z] - YYYY-MM-DD` (exactly)
2. End with `---` on its own line
3. Everything between the header and `---` becomes the GitHub Release body

See the **Release Management** section in `CLAUDE.md` for complete formatting guidelines, examples, and troubleshooting.

## Troubleshooting

### Release workflow didn't trigger

- **Check tag format**: Must be `vX.Y.Z` (e.g., `v1.0.0`, not `1.0.0` or `v1.0`)
- **Verify tag was pushed**: `git push --tags` (not just `git push`)
- **Check Actions tab**: Look for failed workflow runs at [Actions](https://github.com/daveknapik/tone-drone/actions)
- **Verify permissions**: The workflow needs `contents: write` permission (should be automatic)

### Release has no notes / wrong notes

- **Check version header**: Must be exactly `## [X.Y.Z] - YYYY-MM-DD` (two `##`, brackets, dash, date)
- **Verify separator**: Section must end with `---` on its own line
- **Check version match**: Version in CHANGELOG.md must match the tag (without the `v` prefix)
  - Tag: `v1.0.0` → CHANGELOG: `## [1.0.0] - 2025-11-11`
- **Test locally**: Use the npm script to test changelog extraction:
  ```bash
  npm run release:test 1.0.0
  ```
  Or run the extraction manually:
  ```bash
  VERSION_NUMBER="1.0.0"
  awk -v ver="$VERSION_NUMBER" '/^## \[/ {if (found) exit; if ($0 ~ "^## \\[" ver "\\]") {found=1; next}} found {if (/^## \[/ || /^---$/) exit; print}' CHANGELOG.md
  ```
- **Check workflow logs**: Look for extraction errors in GitHub Actions logs

### Changelog extraction failed

- **Verify format**: The version header must match exactly: `## [X.Y.Z] - YYYY-MM-DD`
- **Check for typos**: Common mistakes:
  - `### [1.0.0]` (three `#` instead of two)
  - `## [v1.0.0]` (includes `v` prefix - should be removed)
  - `## [1.0.0]-2025-11-11` (missing spaces around dash)
  - Missing `---` separator at end of section
- **Test extraction**: Use the command above to test locally before tagging

### Want to delete/update a release

- Go to [Releases page](https://github.com/daveknapik/tone-drone/releases)
- Click "Edit" on the release
- You can update the notes, delete the release, or make it a draft

### Want to re-create a release

```bash
# Delete the tag locally and remotely
git tag -d vX.Y.Z
git push origin :refs/tags/vX.Y.Z

# Fix CHANGELOG.md or other issues
# Then re-create the tag
git tag vX.Y.Z
git push --tags
```

## Files Involved

- **CHANGELOG.md** - Source of truth for release notes
- **package.json** - Version number (line 4)
- **.github/workflows/release.yml** - Automated release creation
- **.github/workflows/deploy.yml** - Auto-deploy to GitHub Pages (unchanged)
- **CLAUDE.md** - Detailed formatting guidelines for Claude instances

## Example: Cutting v1.0.0

```bash
# 1. Update CHANGELOG.md
# Add section: ## [1.0.0] - 2025-11-11 with release notes

# 2. Bump version to 1.0.0
npm run version:major
# (package.json now shows "version": "1.0.0")

# 3. Commit and tag
git add package.json CHANGELOG.md
git commit -m "chore: release v1.0.0"
git tag v1.0.0
git push && git push --tags

# 4. Check GitHub
# - Releases page: https://github.com/daveknapik/tone-drone/releases
# - Actions page: https://github.com/daveknapik/tone-drone/actions
# - Live site: https://daveknapik.github.io/tone-drone/
```

Done!
