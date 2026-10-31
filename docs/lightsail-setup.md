# Lightsail setup

This is the manual deployment guide for a native Linux installation. These steps have not been executed on a Lightsail instance yet. The Ubuntu commands below assume an Ubuntu blueprint; adapt them if an existing instance uses another distribution.

## 1. Record the deployment details

Before provisioning or connecting, identify the AWS region, instance name, OS, public IP address, SSH user, and local private-key path. Choose the instance size when the workload and budget are known. Keep private keys outside this repository.

For a new instance, use an Ubuntu LTS blueprint as the starting point. Restrict SSH access to the intended source IP addresses in the Lightsail firewall. Additional inbound ports depend on the selected messaging integration; do not expose a dashboard or API by default.

## 2. Connect

For an Ubuntu instance, substitute the actual key path and public address:

```bash
chmod 400 /path/to/lightsail-key.pem
ssh -i /path/to/lightsail-key.pem ubuntu@INSTANCE_PUBLIC_IP
```

AWS also provides browser-based SSH through the Lightsail console.

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
hermes setup
hermes
```

Select the model provider and model in setup, then verify a basic conversation. Supply credentials through Hermes setup on the instance. On a default Linux install, Hermes stores user data in `~/.hermes`; this directory must stay out of Git.

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
