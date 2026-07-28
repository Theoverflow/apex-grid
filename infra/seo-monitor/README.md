# AWS SEO Monitor

Audit externe quotidien à coût minimal : EventBridge → Lambda → S3, avec alertes SNS et budget AWS.

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

L'abonnement SNS par e-mail doit être confirmé. La Lambda limite volontairement l'exploration à 100 URL et une seule exécution simultanée.
