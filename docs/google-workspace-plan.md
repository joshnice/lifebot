# Gmail and Google Calendar integration

Status: Google OAuth completed on 2026-10-31 with exactly Gmail read-only and Calendar read-only scopes and an offline refresh token. Gmail and Calendar read access were both verified. The initial Calendar `accessNotConfigured` error was resolved by enabling Google Calendar API in the client's project. No messages or calendar data were changed during verification.

## Approach

Hermes ships a `google-workspace` skill at `~/.hermes/skills/productivity/google-workspace/`. Its OAuth credentials belong to the instance's Hermes profile, separately from AWS deployment credentials and ChatGPT model authentication.

The installed v0.22.5 setup script was inspected on 2026-10-31. Its original `SCOPES` list included Gmail send/modify, full Calendar, and additional Workspace write permissions. The setup and API helpers have now been narrowed with [the read-only deployment patch](../patches/README.md), and the skill instructions record this restriction. The generated authorization URL was checked offline for exactly the two intended scopes, state, and PKCE. Newer online documentation can differ from the installed release. Recheck these restrictions after skill updates.

## Initial OAuth scopes

- `https://www.googleapis.com/auth/gmail.readonly`: search/read mail without sending, label changes, or marking messages read.
- `https://www.googleapis.com/auth/calendar.readonly`: read calendars and events without changing them.

Do not request Drive, Contacts, Sheets, Docs, or write scopes as part of this initial connection. Saved mailbox drafts are external writes even if unsent; suggestions written in a Discord response are not saved Gmail drafts.

## Connection prerequisites

1. Use a Google Cloud project dedicated to Life Bot or a suitable existing project.
2. Enable the Gmail API and Google Calendar API.
3. Configure the OAuth consent screen and add the intended Google account as a test user if the app is in testing.
4. Create a Desktop app OAuth client and download its client JSON outside this repository.
5. Transfer the downloaded client JSON privately to the instance and finish the native Hermes skill's OAuth setup over SSH. The helper is prepared; Google consent still opens in your laptop browser.
6. Keep client credentials and refresh tokens in the private Hermes data directory. Protect offline access and review Google's testing-mode token expiry before relying on recurring jobs.

Managed Workspace accounts may need administrator approval. Account choice and OAuth client registration still need to be completed by the user. No Google project or client was created while recording this plan.

Do not install a separate OAuth app or copy your AWS deployment `.env` to the server. The native skill stores its Google client in `~/.hermes/google_client_secret.json`, token in `~/.hermes/google_token.json`, and pending PKCE state in its own temporary JSON file. None belongs in Git or Discord messages.

## Verification

Verify an explicitly requested mailbox search and event listing, including timezone handling. Confirm that viewing an unread email leaves it unread and event queries leave calendars unchanged. Keep message bodies and event details out of repository test fixtures and logs.

Any future write path must check explicit authorization for the particular action. Request broader consent only for capabilities the user chooses to enable. Test that unrequested sends, draft creation, message modifications, event changes, invitations, and RSVPs are blocked.

## References

- [Hermes Google Workspace skill](https://hermes-agent.nousresearch.com/docs/user-guide/skills/google-workspace).
- [Gmail OAuth scopes](https://developers.google.com/workspace/gmail/api/auth/scopes).
- [Calendar OAuth scopes](https://developers.google.com/workspace/calendar/api/auth).
