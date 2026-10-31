# Lightsail setup

This guide covers a native Hermes installation on Ubuntu 24.04. To create an instance using this repository, first follow [CDK deployment](cdk-deployment.md). See [deployment notes](deployment-notes.md) for the existing instance.

## Scripted setup

The Node.js script `scripts/setup-instance.mjs` runs on your laptop and connects to the instance over SSH. No Node.js installation is needed on the server to run this setup.

Set the following in your local `.env`, using the deployment output and your actual key path:

```dotenv
LIGHTSAIL_HOST=15.206.168.38
LIGHTSAIL_SSH_USER=ubuntu
LIGHTSAIL_SSH_KEY=~/Downloads/LightsailDefaultKey-ap-south-1.pem
```

From the repository directory on your laptop:

```bash
npm run setup:instance
npm run setup:instance -- --configure
```

The first command installs prerequisites and the stable Hermes release using its official installer, verifies the CLI, and enables user services after logout. If no swap is active, it creates and enables a 2 GB `/swapfile` and adds it to `/etc/fstab`, so builds fit on the 2 GB instance and swap survives reboot. An existing `/swapfile` is enabled without being overwritten; if it is not valid swap, setup stops. Existing Hermes installations are preserved. Browser tools remain enabled; the desktop computer-use driver is skipped on this headless server. The server's SSH user needs passwordless sudo, as provided by the Ubuntu Lightsail blueprint.

The second command also opens the model and messaging wizards in your terminal, installs the gateway user service, starts it, and shows its status. Answer the provider, model, messaging, and allowed-user prompts there. These interactive steps cannot be completed unattended without choosing a provider and channel.

### Connect your ChatGPT subscription

Lifebot will use Hermes's **OpenAI Codex** provider through your ChatGPT subscription. During `--configure`, the script runs `hermes model`. Choose **ChatGPT or Codex Subscription**, open the URL shown in your laptop browser, enter the device code, and sign in to the account holding your subscription. Then choose an available model. No OpenAI API key or separate Codex CLI installation is required for this Hermes provider.

Hermes stores the login in its own `~/.hermes/auth.json` on the instance and manages token refresh. Do not put OAuth tokens in this repository or the laptop's deployment `.env`. A successful login and a real conversation are needed to verify model access; Hermes's provider docs do not specify the eligible plan tiers or detailed quota accounting.

If device-code login is disabled for your account or workspace, Hermes documents a browser flow via `hermes auth add openai-codex --browser`. That alternative requires an SSH tunnel for port 1455 when signing in from a remote server; use the default device-code flow first.

Only commands and the public upstream installer are sent over SSH. Your local `.env`, AWS access keys, and SSH private key stay on your laptop. Hermes stores its own credentials and state under the server user's `~/.hermes` directory. No firewall changes, backups, or reboots are performed by the script. Fresh installs follow the current stable release rather than a pinned build.

Use Hermes's update command separately when you intend to upgrade. After setup, open a new SSH session or run `export PATH="$HOME/.local/bin:$PATH"` on the instance to use `hermes` in your current shell. Test a real conversation and service operation after logout.

## Manual alternative

The commands below describe the same installation and configuration steps if you prefer to run them manually.

## 1. Record the deployment details

Before provisioning or connecting, identify the AWS region, instance name, OS, public IP address, SSH user, and local private-key path. Choose the instance size when the workload and budget are known. Keep private keys outside this repository.

For a new instance, use an Ubuntu LTS blueprint as the starting point. Restrict SSH access to the intended source IP addresses in the Lightsail firewall. Additional inbound ports depend on the selected messaging integration; do not expose a dashboard or API by default.

## 2. Connect

For an Ubuntu instance, substitute the actual key path and public address:

```bash
chmod 400 /path/to/lightsail-key.pem
ssh -i /path/to/lightsail-key.pem ubuntu@INSTANCE_PUBLIC_IP
```

AWS also provides browser-based SSH through the Lightsail console, but the CDK stack's firewall does not enable its source-address alias by default.

## 3. Install Hermes

Run these commands on the instance as the non-root account that will own Lifebot. Use that same account for setup and service management so they share one Hermes data directory.

```bash
sudo apt-get update
sudo apt-get install -y git curl ca-certificates tar coreutils
curl -fsSL https://hermes-agent.nousresearch.com/install.sh -o /tmp/lifebot-hermes-install.sh
less /tmp/lifebot-hermes-install.sh
bash /tmp/lifebot-hermes-install.sh
source ~/.bashrc
hermes --help
```

The official installer selects a stable Hermes release and manages its runtime dependencies. Record the installed release in the deployment notes when this step is completed. For reproducible future provisioning, add a reviewed version-pinning strategy before automating installation.

## 4. Configure and verify the agent

```bash
hermes model
hermes
```

Select **ChatGPT or Codex Subscription**, complete the device-code login in your laptop browser, and choose an available model. Then verify a basic conversation. On a default Linux install, Hermes stores user data in `~/.hermes`; this directory must stay out of Git.

## 5. Enable messaging and continuous operation

After choosing a messaging platform, configure its credentials and permitted users through Hermes:

```bash
hermes gateway setup
hermes gateway install
sudo loginctl enable-linger "$(id -un)"
hermes gateway start
hermes gateway status
```

Hermes installs a user service on Linux. Lingering allows that user's service manager to run without an active login. Review the wizard's output if it has already installed or started the gateway. Test a message from the permitted user, then verify that the gateway still works after logout and an instance reboot.

## 6. Record the working deployment

Document the instance identity, OS, installed Hermes release, model provider, selected platform, service status, and verification results. Include a backup and restore procedure for Hermes state before relying on Lifebot for important information. Keep tokens and private user data out of those notes.

## References

- [AWS: connect to Lightsail using SSH](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-ssh-using-terminal.html).
- [Hermes: installation](https://hermes-agent.nousresearch.com/docs/getting-started/installation).
- [Hermes: messaging gateway and service commands](https://hermes-agent.nousresearch.com/docs/user-guide/messaging).
- [Hermes: OpenAI Codex subscription authentication](https://hermes-agent.nousresearch.com/docs/integrations/providers).
