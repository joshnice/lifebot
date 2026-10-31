# Working on Lifebot

Lifebot is a personal assistant built on Nous Research's Hermes Agent and hosted on AWS Lightsail.

## Project boundaries

- Keep Hermes as the upstream runtime. Add project-specific configuration, skills, integrations, and deployment tooling here as needed.
- Read `README.md` and the relevant files under `docs/` before changing the project.
- Verify Hermes commands and configuration against its official documentation or source before introducing them. Do not invent a configuration schema.
- Keep credentials, private keys, conversations, memory, and other runtime data out of Git. Use sanitized example files when configuration templates are needed.
- Update documentation when changing setup or operational behavior.

## Validation

Use Node.js 24 and `npm ci`. Run `make check` for whitespace, `npm test` for TypeScript compilation and infrastructure assertions, and `npm run synth` to validate CDK synthesis after infrastructure changes. These checks do not validate regional availability or a running deployment. Never put credentials in CDK parameters, context, or user data.
