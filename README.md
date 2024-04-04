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
