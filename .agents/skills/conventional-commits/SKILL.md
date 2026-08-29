---
name: conventional-commits
description: >-
  Use this skill whenever the user asks to make a git commit, stage changes, or
  write a commit message for the react-callback-hooks project. Enforces
  Conventional Commits rules tuned for release-please so that only intentional
  changes trigger a new npm release.
---

# Conventional Commits for release-please

This project publishes to npm via **release-please**. release-please reads the
git history and bumps versions only when it sees specific commit types. Use this
skill every time you build a commit message.

---

## Commit format

```
<type>(<scope>): <subject>

[optional body]

[optional footers]
```

- **type**: one of the values in the table below (lowercase, no spaces)
- **scope**: optional, lowercase (e.g. `hooks`, `types`, `docs`, `site`)
- **subject**: imperative, present tense, no trailing period, max 72 chars
- **BREAKING CHANGE footer**: triggers a major bump

---

## Type reference

| Type       | Triggers release-please? | npm version bump | When to use                                |
| ---------- | :----------------------: | :--------------: | ------------------------------------------ |
| `feat`     |           YES            |      minor       | New public hook or API addition            |
| `fix`      |           YES            |      patch       | Bug fix in published library code (`src/`) |
| `perf`     |           YES            |      patch       | Performance improvement in library code    |
| `revert`   |           YES            |      patch       | Reverts a previous feat/fix                |
| `refactor` |            NO            |        —         | Internal restructure, no behaviour change  |
| `docs`     |            NO            |        —         | README, JSDoc, markdown updates            |
| `style`    |            NO            |        —         | Formatting, whitespace, prettier           |
| `test`     |            NO            |        —         | Adding or fixing tests                     |
| `chore`    |            NO            |        —         | Tooling, config, deps (non-library)        |
| `ci`       |            NO            |        —         | GitHub Actions, workflows                  |
| `build`    |            NO            |        —         | Build scripts, tsconfig, esbuild           |
| `site`     |            NO            |        —         | Changes only inside `site/` directory      |

> A `BREAKING CHANGE:` footer on **any** type triggers a **major** bump and
> a release.

---

## Decision tree — choosing the right type

```
Did you change anything inside src/ ?
  YES →
    Does it add a new exported hook or change the public API?
      YES → feat
      NO →
        Is it a bug fix?
          YES → fix
          NO →
            Is it a performance improvement?
              YES → perf
              NO → refactor   ← NO release
  NO →
    Is it only inside site/?   → site   ← NO release
    Is it docs/README?         → docs   ← NO release
    Is it formatting only?     → style  ← NO release
    Is it tooling/config?      → chore  ← NO release
    Is it CI/CD?               → ci     ← NO release
    Is it the build system?    → build  ← NO release
```

---

## Rules enforced by the commit-msg hook

The file `.git/hooks/commit-msg` (installed by this project) rejects commits
that break these rules:

1. The message must match `^(feat|fix|perf|revert|refactor|docs|style|test|chore|ci|build|site)(\(.+\))?: .+`
2. The subject line must be **≤ 72 characters**.
3. The type must be **all lowercase**.
4. `BREAKING CHANGE` must appear as a footer line (not in the subject).

If the hook rejects a message, correct it before re-committing.

---

## Examples

```
# Releases a patch
fix(hooks): prevent stale closure in useDebounceCallback

# Releases a minor
feat(hooks): add useThrottleCallback hook

# Releases a major
feat(hooks): redesign callback signature

BREAKING CHANGE: callbacks now receive an event object instead of raw args

# No release
chore: update esbuild to 0.25.9

# No release
docs: add usage example for useDebounceCallback

# No release
site: update demo page copy

# No release
refactor(hooks): extract shared timer logic into util
```

---

## Steps to commit

1. Stage files: `git add <files>`
2. Choose the correct type using the decision tree above.
3. Run: `git commit -m "<type>(<scope>): <subject>"`
4. If the hook rejects the message, read the error and fix the type or format.
5. Verify with `git log --oneline -1`.
