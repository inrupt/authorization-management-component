# ⚠️ ARCHIVED REPOSITORY ⚠️
- archive_date: 2026-03-25
- archived_by: avazinrupt
- last_commit: 1ff93fb
- original_purpose: A tool for accepting and revoking AccessGrants to Pod data
- deprecation_reason: No longer in use
- replacement_solution: none
- security_scan_partition: archived-repos
- review_schedule: semi-annual
- next_review: [2026-08-01]
## 🚨 SECURITY WARNING 🚨
This repository is **ARCHIVED** and **NO LONGER MAINTAINED**. It may contain:
- Known security vulnerabilities that will NOT be fixed
- Outdated dependencies with critical security issues
- Deprecated practices that do not meet current security standards
**DO NOT USE THIS CODE (E.G. IN PRODUCTION)**
### ⛔ This Repository:
- Is NOT actively maintained
- Will NOT receive security updates
- Will NOT receive bug fixes
- Should NOT be used as a reference for current practices
### 📞 Questions?
Contact: [security@inrupt.com](mailto:security@inrupt.com)
[https://inrupt.com/security](https://inrupt.com/security)
---
This repository is retained for compliance/historical purposes only under the Inrupt Source Code Archive Standards.
---
# Original README
# AMC: Authorization Management Component

## A tool for accepting and revoking AccessGrants to Pod data

## Getting Started

First, install dependencies and start the development server:

```bash
npm ci && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the Authorization Management Component Application

## Development

Follow the commit conventions outlined here https://cbea.ms/git-commit/ and expose environment variables via the `next.config.js`

## Deployment

You can deploy the Application via a node server, or thru Vercel

- For deploying to Vercel, use `npm deploy`
- To run the the node server, run `npm run build` and `npm run start`

## Versioning

Please see the instructions in the .changeset folder for steps on versioning [with changesets](https://github.com/inrupt/authorization-management-component/tree/staging/.changeset/README.md)
