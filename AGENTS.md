# Working on Lifebot

Lifebot is a personal assistant built on Nous Research's Hermes Agent and hosted on AWS Lightsail.

## Project boundaries

- Keep Hermes as the upstream runtime. Add project-specific configuration, skills, integrations, and deployment tooling here as needed.
- Read `README.md` and the relevant files under `docs/` before changing the project.
- Verify Hermes commands and configuration against its official documentation or source before introducing them. Do not invent a configuration schema.
- Keep credentials, private keys, conversations, memory, and other runtime data out of Git. Use sanitized example files when configuration templates are needed.
- Update documentation when changing setup or operational behavior.

## Validation

Run `make check` after changes. This currently checks whitespace only; it does not validate a Hermes installation or deployment. As executable functionality is added, include checks appropriate to that functionality.
