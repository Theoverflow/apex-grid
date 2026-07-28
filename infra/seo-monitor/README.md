# AWS SEO Monitor (free-tier)

Audit technique externe quotidien, indépendant de GitHub Actions :

`EventBridge` → `Lambda (arm64)` → rapports `S3` + alertes `SNS` / `CloudWatch` + budget AWS.

## Prérequis

```bash
# depuis la racine du dépôt
npm run package:seo-lambda
cp infra/seo-monitor/terraform.tfvars.example infra/seo-monitor/terraform.tfvars
```

## Déploiement

```bash
cd infra/seo-monitor
terraform init
terraform plan
terraform apply
```

Confirmer l'abonnement e-mail SNS. La Lambda explore au plus 100 URL, mémoire 256 Mo, concurrency 1, logs 14 jours, rapports expirés après 90 jours.

Le workflow `.github/workflows/infra.yml` exécute `npm run package:seo-lambda` puis `terraform plan/apply` via OIDC.
