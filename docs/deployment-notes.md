# Deployment notes

Verified through the Lightsail API on 2026-10-31 after successful CloudFormation deployment.

| Setting | Value |
| --- | --- |
| Stack | `LifebotStack` |
| Region | Mumbai (`ap-south-1`) |
| Instance | `lifebot` |
| State | Running |
| Blueprint | Ubuntu 24.04 LTS (`ubuntu_24_04`) |
| Bundle | `small_3_1` |
| Resources | 2 vCPUs, 2 GB RAM, 60 GB SSD |
| Plan | $12/month, 1,536 GB transfer, public IPv4 |
| Public IP at verification | `15.206.168.38` (not static) |
| SSH user | `ubuntu` |
| SSH key pair | `LightsailDefaultKeyPair` in Mumbai |
| Firewall | TCP 22 only, restricted to the CIDR configured in `.env`; no IPv6 ingress |

The first attempt used `small_3_0`, which is unavailable in Mumbai. Its stack rolled back with no surviving resources. The failed application stack was removed and recreated with `small_3_1`. The `CDKToolkit` bootstrap stack was preserved.

Hermes has not been installed yet. Download the regional default private key from the Lightsail console if you do not already have it, then connect and follow [Lightsail setup](lightsail-setup.md).
