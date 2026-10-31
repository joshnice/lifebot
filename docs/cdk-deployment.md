# CDK deployment

The TypeScript CDK v2 app creates a single `AWS::Lightsail::Instance`. The stack name is `LifebotStack`. Dependencies are pinned; use Node.js 24 and `npm ci`.

## Local validation

```bash
npm ci
make check
npm test
npm run synth
```

Tests check the synthesized firewall rules, key-pair selection, required SSH input, and connection outputs. Synthesis does not create resources or verify regional Lightsail availability. `npm run build` compiles TypeScript into `dist/`; the CDK app runs that compiled entry point. The synth, diff, and deploy scripts build automatically. Build first when using `npm run cdk -- ...` directly.

Dependency audit at setup reports a moderate advisory in CDK's bundled `minimatch` dependency, also attributed to `aws-cdk-lib` (two audit entries). npm currently reports no available fix. Recheck with `npm audit` when updating CDK; the dependency is used by local infrastructure tooling.

## Select an account and region

The stack targets Mumbai (`ap-south-1`), the closest supported Lightsail region to Dubai. Lightsail is not currently listed as available in UAE or Bahrain.

AWS CLI installation is not required. The project installs the CDK CLI through npm, and it can authenticate using the access keys in `.env`.

In the AWS Console, open **IAM > Users > your deployment user > Security credentials > Access keys > Create access key**. Use an IAM user's keys rather than root access keys. Save the access key ID and secret access key; AWS only shows the secret when the key is created. The IAM user needs permissions to bootstrap CDK and deploy the CloudFormation/Lightsail resources. Access keys authenticate that user; they do not grant additional permissions.

Create your local environment file without overwriting an existing one:

```bash
cp -n .env.example .env
```

Edit `.env` and replace the placeholders in `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. Only set `AWS_SESSION_TOKEN` when using temporary credentials. Leave `AWS_PROFILE` commented out for this approach.

Set `SSH_ALLOWED_CIDR` to your public IPv4 address with `/32`. The npm wrapper passes this value as the `SshAllowedCidr` stack parameter for both `diff` and `deploy`. An explicit `--parameters SshAllowedCidr=...` overrides the environment value.

All npm CDK commands load `.env` automatically using Node.js's built-in environment-file support. Variables already exported in your shell take precedence. Running `npx cdk` directly bypasses that loading.

Find your 12-digit account ID in the account menu at the top right of the AWS Console. Use that ID in the bootstrap command below. Keep `.env` private; it is already ignored by Git. Do not put model-provider keys or messaging tokens here; configure those through Hermes on the instance later.

The app uses the account resolved by the CDK CLI from your credentials and explicitly sets `ap-south-1` in `bin/lifebot.ts`. Changing the environment-file region does not change the stack's target region; edit that file to move the deployment.

Verify the Ubuntu 24.04 blueprint and the selected general-purpose, dual-stack plan (2 GB RAM, 2 vCPUs, 60 GB SSD) in the Lightsail console with Mumbai selected. This matches the chosen `ubuntu_24_04` and `small_3_1` defaults. An existing AWS profile remains an alternative: comment out the access keys and uncomment `AWS_PROFILE` in `.env`.

Queried the Mumbai Lightsail API on 2026-10-31: the matching active Linux bundle is `small_3_1`, with public IPv4, $12/month, and 1,536 GB transfer. The `small_3_0` ID shown in general AWS documentation examples is not available in this region.

## Stack parameters

| Parameter | Default | Purpose |
| --- | --- | --- |
| `InstanceName` | `lifebot` | Instance name, unique in the account and region |
| `BlueprintId` | `ubuntu_24_04` | Linux OS blueprint |
| `BundleId` | `small_3_1` | Instance plan; verify current regional availability and price |
| `SshAllowedCidr` | Required | Your public IPv4 address with `/32`, or an intended IPv4 network |
| `KeyPairName` | `default` | Existing regional Lightsail key pair; the sentinel `default` omits the property to select the regional default |

The stack opens TCP port 22 only for `SshAllowedCidr`. It adds no IPv6 firewall rules or browser-based SSH alias. You need the selected private key locally to connect over SSH.

## Review and deploy

Bootstrap the target environment once if it has not already been bootstrapped:

Replace `YOUR_ACCOUNT_ID` with the 12-digit account ID from the AWS Console. Compile the app before the first bootstrap:

```bash
npm run build
npm run cdk -- bootstrap aws://YOUR_ACCOUNT_ID/ap-south-1
npm run diff
```

After filling in `SSH_ALLOWED_CIDR` in `.env`, deploy:

```bash
npm run deploy
```

To override the plan, blueprint, or key, pass additional parameters:

```bash
npm run deploy -- \
  --parameters SshAllowedCidr=203.0.113.10/32 \
  --parameters BlueprintId=ubuntu_24_04 \
  --parameters BundleId=small_3_1 \
  --parameters KeyPairName=your-lightsail-key
```

Deployment outputs include `PublicIpAddress`, `SshUser`, `InstanceNameOutput`, and `InstanceArn`. Use the output IP and user with your private key, then follow [Lightsail setup](lightsail-setup.md) from the install step.

## Lifecycle

If an initial deployment fails and the stack reaches `ROLLBACK_COMPLETE`, CloudFormation cannot update that failed stack. After confirming it has no surviving resources, remove only the failed application stack and deploy again:

```bash
npm run cdk -- destroy LifebotStack
npm run deploy
```

Do not delete the `CDKToolkit` bootstrap stack. Rebootstrapping is not needed for a bundle-ID correction.

The stack creates the instance only. It does not install Hermes, configure a provider, or create a static IP or backups. The public IP can change after stopping and starting the instance. If your source IP changes, update `SSH_ALLOWED_CIDR` in `.env` and run `npm run deploy` again.

Deleting the stack deletes the instance and its local data. Back up Hermes state before deleting the stack. AWS does not support in-place CloudFormation changes to the instance's blueprint or bundle; plan a separate migration if either must change.

## References

- [AWS CDK Lightsail instance construct](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lightsail.CfnInstance.html).
- [CloudFormation instance properties and update behavior](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lightsail-instance.html).
- [Lightsail firewall port properties](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-lightsail-instance-port.html).
- [AWS CLI Lightsail commands](https://docs.aws.amazon.com/cli/latest/reference/lightsail/).
- [Supported Lightsail regions](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-regions-and-availability-zones-in-amazon-lightsail.html).
- [AWS CLI profiles and credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).
- [Creating IAM user access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-keys-admin-managed.html).
- [Node.js environment-file loading](https://nodejs.org/api/cli.html#--env-filefile).
