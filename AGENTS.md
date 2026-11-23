# LookAtMe

Personal portfolio site built with Next.js. The app lives in `lookatme/`; content is MDX in `lookatme/src/content/`.

## KAREN OS

This project uses the KAREN OS shared rules. Before acting, read `karen_os_path`
from `.karen/project.json` and run
`python3 -B <karen_os_path>/scripts/startup.py read --project .`
If that path does not exist, as in a cloud session, clone `karen_os_repository`
from GitHub and run the reader from the clone.
Follow the shared core it returns, including the engineering standard. If the
command fails or reports the project as invalid, say the shared rules are
unavailable and do read-only work only. If it reports stale, tell the owner
before acting. Rules in this file may add restrictions to the shared rules but
never remove them. This session may read only this project and the KAREN OS
core, and may not read or change other projects.

## How work happens here

- **Work comes from GitHub issues** in `AbhiramYanamandra/LookAtMe`. Do the issue
  the owner names, otherwise the highest-priority `status:ready` issue.
- **Branch** `<type>/<issue>-<short-description>` from `main`, then open a pull
  request with `Closes #<issue>` using the template. Never push to `main` and
  never merge. The owner merges.
- **CI must pass**: `npm run check` in `lookatme/` (content validation, lint,
  tests and build), run by `.github/workflows/checks.yml`.
- **Content changes are the owner's voice.** Don't rewrite case studies, profile
  or experience text unless the issue asks for it.
- **This repository is public.** No personal records, credentials or
  home-directory paths in code, issues or pull requests.
