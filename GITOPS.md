# GitOps production runbook

## Flow

1. Every pull request runs `Quality gate`.
2. A merge to `main` runs the same gate.
3. A successful gate triggers `Deploy production`.
4. GitHub authenticates to AWS with OIDC, without static AWS keys.
5. AWS Amplify deploys the `main` branch.
6. The workflow waits for Amplify, audits production, and submits IndexNow.
7. At 05:17 UTC every day, `SEO monitor` audits production and opens or updates a GitHub incident on regression.

## GitHub environment

Create the protected environment `production`. Require reviewers if desired.

Repository variables:

- `AWS_REGION`, for example `eu-west-3`
- `AMPLIFY_APP_ID`
- `AMPLIFY_BRANCH`, normally `main`
- `PRODUCTION_URL`, for example `https://www.apex-grid.fr`
- `INDEXNOW_HOST`, for example `www.apex-grid.fr`

Environment secrets:

- `AWS_GITHUB_ROLE_ARN`
- `INDEXNOW_KEY`

## AWS OIDC trust policy

Restrict the role to this repository and the production environment:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:Theoverflow/<REPOSITORY>:environment:production"
      }
    }
  }]
}
```

Minimum role permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "amplify:StartJob",
      "amplify:GetJob"
    ],
    "Resource": "arn:aws:amplify:<REGION>:<ACCOUNT_ID>:apps/<AMPLIFY_APP_ID>/branches/main/jobs/*"
  }]
}
```

Validate the exact Amplify ARN pattern in IAM for the target account before production.

## Infrastructure SEO AWS à faible coût

Le dossier `infra/seo-monitor` est désormais complet. Terraform provisionne :

- une Lambda Node.js limitée à 256 Mo, 120 secondes et une concurrence ;
- une règle EventBridge quotidienne ;
- un bucket S3 privé avec chiffrement et expiration des rapports ;
- un topic SNS facultatif pour les alertes ;
- un budget mensuel AWS avec alerte prévisionnelle à 80 %.

Variables GitHub supplémentaires :

```text
ALERT_EMAIL=seo@example.com
MONTHLY_BUDGET_USD=5
```

Le workflow `.github/workflows/infra.yml` exécute `terraform plan` sur les pull requests et `terraform apply` après merge sur `main`.

### État Terraform

Pour une équipe, configurez un backend S3 avec verrouillage `use_lockfile = true`. Le backend n'est pas codé en dur afin d'éviter de créer une dépendance circulaire avant le premier déploiement.

### Free Tier

Le projet minimise les coûts, mais AWS ne garantit pas une facture nulle. Amplify dépend du trafic, du volume de build et de l'ancienneté du compte. La Lambda quotidienne et EventBridge restent très largement sous leurs quotas gratuits usuels. Le budget est une alerte, pas un plafond bloquant.
