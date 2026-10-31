import { execFileSync, spawnSync } from 'node:child_process';
import { accessSync, constants, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: npm run setup:instance [-- --configure]');
  console.log('Runs from your laptop over SSH. --configure opens the Hermes setup wizards.');
  process.exit(0);
}

try {
  if (args.some((arg) => arg !== '--configure')) {
    throw new Error('Only --configure is supported. Use --help for usage.');
  }
  const configure = args.includes('--configure');
  if (configure && (!process.stdin.isTTY || !process.stdout.isTTY)) {
    throw new Error('--configure needs an interactive terminal. Run it from your laptop terminal.');
  }

  const host = process.env.LIGHTSAIL_HOST;
  const user = process.env.LIGHTSAIL_SSH_USER || 'ubuntu';
  const key = process.env.LIGHTSAIL_SSH_KEY;
  if (!host || !/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(host)) {
    throw new Error('Set LIGHTSAIL_HOST in .env to the instance IPv4 address or hostname.');
  }
  if (user === 'root' || !/^[a-z_][a-z0-9_-]*$/.test(user)) {
    throw new Error('LIGHTSAIL_SSH_USER must be a non-root Linux username.');
  }
  if (!key) throw new Error('Set LIGHTSAIL_SSH_KEY in .env to your local private-key path.');
  const keyPath = key.startsWith('~/') ? join(homedir(), key.slice(2)) : key;
  accessSync(keyPath, constants.R_OK);
  const sshOptions = ['-i', keyPath, '-o', 'ConnectTimeout=15', '-o', 'BatchMode=yes'];
  const target = `${user}@${host}`;

  function runRemote(label, command, options = {}) {
    console.log(`\n${label}`);
    return execFileSync('ssh', [
      ...sshOptions,
      ...(options.interactive ? ['-t'] : []),
      target,
      command,
    ], {
      stdio: options.input ? ['pipe', 'inherit', 'inherit'] : 'inherit',
      ...(options.input ? { input: options.input } : {}),
    });
  }

  const os = execFileSync('ssh', [...sshOptions, target, 'cat /etc/os-release'], { encoding: 'utf8' });
  if (!/^ID=ubuntu$/m.test(os) || !/^VERSION_ID="24\.04"$/m.test(os)) {
    throw new Error('This setup supports Ubuntu 24.04 only.');
  }

  runRemote('Updating package lists...', 'sudo -n apt-get update');
  runRemote('Installing system prerequisites...',
    'sudo -n env DEBIAN_FRONTEND=noninteractive apt-get install -y ' +
    'ca-certificates curl git tar coreutils build-essential python3-dev libffi-dev libssl-dev');

  // Hermes builds its UI during installation. Give a small instance swap space
  // so those builds do not exhaust its physical RAM.
  const swap = execFileSync('ssh', [
    ...sshOptions, target, 'swapon --show=NAME --noheadings',
  ], { encoding: 'utf8' }).trim();
  if (!swap) {
    const swapFile = spawnSync('ssh', [
      ...sshOptions, target, 'test -e /swapfile',
    ], { stdio: 'inherit' });
    if (swapFile.status === 1) {
      runRemote('Allocating 2 GB of swap...', 'sudo -n fallocate -l 2G /swapfile');
      runRemote('Restricting swap-file access...', 'sudo -n chmod 600 /swapfile');
      runRemote('Formatting swap...', 'sudo -n mkswap /swapfile');
    } else if (swapFile.error || swapFile.status !== 0) {
      throw new Error('Could not check /swapfile on the instance.');
    }
    runRemote('Enabling swap...', 'sudo -n swapon /swapfile');
    runRemote('Keeping swap enabled after reboot...',
      'grep -qE "^/swapfile[[:space:]]" /etc/fstab || ' +
      'printf "\\n/swapfile none swap sw 0 0\\n" | sudo -n tee -a /etc/fstab > /dev/null');
  }

  const installed = spawnSync('ssh', [
    ...sshOptions, target, 'test -x "$HOME/.local/bin/hermes"',
  ], { stdio: 'inherit' });
  if (installed.error) throw installed.error;
  if (installed.status === 1) {
    console.log('\nDownloading the official Hermes installer...');
    const response = await fetch('https://hermes-agent.nousresearch.com/install.sh', {
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`Installer download failed: HTTP ${response.status}`);
    runRemote('Installing stable Hermes...',
      'bash -s -- --channel stable --non-interactive --skip-computer-use',
      { input: await response.text() });
  } else if (installed.status === 0) {
    console.log('\nHermes already exists; preserving the installation.');
  } else {
    throw new Error(`Could not check the remote installation (SSH exit ${installed.status}).`);
  }

  runRemote('Verifying Hermes...', '"$HOME/.local/bin/hermes" --help > /dev/null');

  // v0.22.5 imports Discord's authorization helper before its optional dependency
  // is available. Resolve that dependency at call time so slash commands work.
  const version = execFileSync('ssh', [
    ...sshOptions, target, '"$HOME/.local/bin/hermes" --version',
  ], { encoding: 'utf8' });
  if (version.includes('Hermes Agent v0.22.5 ')) {
    const patch = readFileSync(new URL('../patches/hermes-discord-slash-auth.patch', import.meta.url));
    const apply = 'git -C "$HOME/.hermes/hermes-agent" apply';
    const alreadyApplied = spawnSync('ssh', [
      ...sshOptions, target, `${apply} --reverse --check -`,
    ], { input: patch, stdio: ['pipe', 'ignore', 'ignore'] });
    if (alreadyApplied.status !== 0) {
      runRemote('Checking Discord slash-command compatibility patch...', `${apply} --check -`, { input: patch });
      runRemote('Applying Discord slash-command compatibility patch...', `${apply} -`, { input: patch });
      runRemote('Reloading the gateway if it is running...',
        'if systemctl --user is-active --quiet hermes-gateway.service; then ' +
        '"$HOME/.local/bin/hermes" gateway restart; fi');
    }
  }
  runRemote('Enabling user services after logout...', `sudo -n loginctl enable-linger ${user}`);

  if (configure) {
    console.log('\nIn the model wizard, choose "ChatGPT or Codex Subscription".');
    console.log('Open the displayed URL on your laptop and enter the device code to sign in.');
    console.log('Select a model available to your subscription; no OpenAI API key is needed.');
    for (const command of ['model', 'gateway setup', 'gateway install', 'gateway start', 'gateway status']) {
      runRemote(`Hermes: ${command}`, `"$HOME/.local/bin/hermes" ${command}`, { interactive: true });
    }
    console.log('\nSetup complete. Test a message from your chosen messaging platform.');
  } else {
    console.log('\nHermes installed. Configure your model and messaging with:');
    console.log('npm run setup:instance -- --configure');
  }
} catch (error) {
  // Do not print subprocess options or the environment: .env holds credentials.
  console.error(`Setup failed: ${error.message}`);
  process.exitCode = 1;
}
