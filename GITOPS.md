# GitOps production runbook

## Flow

1. Every pull request runs `Quality gate`.
2. A merge to `main` runs the same gate.
3. A successful gate triggers `Deploy production`.
4. GitHub authenticates to AWS with OIDC, without static AWS keys.
5. AWS Amplify deploys the `main` branch.
6. The workflow waits for Amplify, audits production (`seo:agent`), and submits IndexNow.
7. At 05:17 UTC every day:
   - `SEO monitor` (GitHub Actions) audits production and opens/updates a GitHub incident on regression.
   - AWS EventBridge invokes the SEO Lambda (external path), writes S3 reports, and alerts via SNS/CloudWatch.
8. Changes under `infra/**` or shared SEO packaging files trigger Terraform plan (PR) / apply (`main`).

See also [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## GitHub environment

Create the protected environment `production`. Require reviewers if desired. Optionally create `preview` for Terraform plans on pull requests.

Repository variables:

- `AWS_REGION`, for example `eu-west-3`
- `AMPLIFY_APP_ID`
- `AMPLIFY_BRANCH`, normally `main`
- `PRODUCTION_URL`, for example `https://apex-grid.darqsh.com`
- `INDEXNOW_HOST`, for example `apex-grid.darqsh.com`
- `ALERT_EMAIL`, for example `seo@example.com`
- `MONTHLY_BUDGET_USD`, for example `5`

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

The Terraform workflow always uses the `production` GitHub environment so it matches this OIDC trust. Apply remains restricted to pushes on `main`.

## Minimum IAM permissions

Amplify deploy job:

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

Terraform / SEO monitor apply (same role or a dedicated infra role):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "lambda:*",
        "iam:GetRole",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:PassRole",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:TagRole",
        "iam:ListRolePolicies",
        "iam:GetRolePolicy",
        "events:*",
        "sns:*",
        "logs:*",
        "cloudwatch:PutMetricAlarm",
        "cloudwatch:DeleteAlarms",
        "cloudwatch:DescribeAlarms",
        "cloudwatch:TagResource",
        "budgets:*",
        "tag:GetResources"
      ],
      "Resource": "*"
    }
  ]
}
```

Tighten these actions to resource ARNs for the `apex-grid-*` prefix before long-term production use. Validate Amplify ARN patterns in IAM for the target account.

## Infrastructure SEO AWS à faible coût

```bash
npm run package:seo-lambda
cp infra/seo-monitor/terraform.tfvars.example infra/seo-monitor/terraform.tfvars
cd infra/seo-monitor && terraform init && terraform apply
```

Terraform provisionne :

- Lambda Node.js 20 arm64, 256 Mo, 120 s, concurrency 1
- EventBridge quotidien (05:17 UTC)
- bucket S3 privé chiffré + expiration 90 jours
- topic SNS + alarme CloudWatch sur erreurs Lambda
- budget mensuel AWS (alerte forecast 80 % + actual 100 %)

Le workflow `.github/workflows/infra.yml` packagé la Lambda, exécute `terraform plan` sur les PR et `apply` après merge sur `main`.

### État Terraform

Pour une équipe, configurez un backend S3 avec verrouillage `use_lockfile = true`. Le backend n'est pas codé en dur afin d'éviter une dépendance circulaire avant le premier déploiement.

### Free Tier

Le projet minimise les coûts, mais AWS ne garantit pas une facture nulle. Amplify dépend du trafic, du volume de build et de l'ancienneté du compte. La Lambda quotidienne et EventBridge restent très largement sous leurs quotas gratuits usuels. Le budget est une alerte, pas un plafond bloquant.
