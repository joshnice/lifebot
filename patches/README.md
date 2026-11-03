# Hermes compatibility patches

`hermes-discord-slash-auth.patch` fixes a reproduced Hermes v0.22.5 startup-order bug: `adapter_slash_auth.py` can import before the optional Discord dependency is adopted and retain `discord = None`. Native slash commands then fail with `AttributeError: 'NoneType' object has no attribute 'DMChannel'`, while ordinary chat works.

The patch resolves `discord` inside the authorization method after the runtime dependency is available. It does not bypass user or channel authorization. A regression harness reproduced the unpatched failure and verified allowed users, rejected users, missing users, allowed/blocked channels, and allowed/rejected DM users after the patch.

The Node setup script applies it only to v0.22.5, skips it when already applied, and restarts an active gateway when it changes the file. A context mismatch stops setup for review rather than overwriting an unexpected upstream version. Reassess this patch when upgrading Hermes; it is a local modification to the upstream checkout.

Upstream report: [NousResearch/hermes-agent #137083](https://github.com/NousResearch/hermes-agent/issues/137083).

## Google Workspace read-only deployment

`hermes-google-readonly.patch` applies to the installed skill files under the Hermes data directory, not the upstream source checkout. It narrows the setup and API helpers to `gmail.readonly` and `calendar.readonly`, and records the deployment policy in the skill's instructions. The Google optional Python dependency extra was installed through Hermes PM.

This patch does not connect an account or change existing Google grants. OAuth credentials and consent are still required. The generated authorization URL was checked offline to contain exactly those two scopes, state, and PKCE. Both helper scope lists were also checked. No Google API call or account authorization was made during those checks.

For a fresh copy of this skill, apply it from the repository on your laptop:

```bash
ssh -i /path/to/your-key.pem ubuntu@INSTANCE_IP \
  'cd "$HOME/.hermes" && git apply --check -' < patches/hermes-google-readonly.patch
ssh -i /path/to/your-key.pem ubuntu@INSTANCE_IP \
  'cd "$HOME/.hermes" && git apply -' < patches/hermes-google-readonly.patch
```

Skill syncs and upgrades may replace these installed files. Recheck scopes before any later authorization. Existing read-only tokens cannot acquire write access merely because code changes; broader access requires new user consent.
