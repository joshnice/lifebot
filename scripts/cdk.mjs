import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function cdkArguments(args, env) {
  const result = [...args];
  const explicitCidr = args.some((arg) =>
    /(?:^|=)(?:LifebotStack:)?SshAllowedCidr=/.test(arg),
  );
  if (['deploy', 'diff'].includes(args[0]) && env.SSH_ALLOWED_CIDR && !explicitCidr) {
    result.push('--parameters', `LifebotStack:SshAllowedCidr=${env.SSH_ALLOWED_CIDR}`);
  }
  return result;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const cliPath = fileURLToPath(new URL('../node_modules/aws-cdk/bin/cdk', import.meta.url));
  const result = spawnSync(process.execPath, [
    cliPath,
    ...cdkArguments(process.argv.slice(2), process.env),
  ], { stdio: 'inherit', env: process.env });
  if (result.error) {
    console.error(result.error.message);
  }
  process.exitCode = result.status ?? 1;
}
