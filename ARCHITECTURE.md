# Architecture AWS free-tier — Apex Grid

Plateforme éditoriale Next.js déployée sur Amplify Hosting SSR, avec double surveillance SEO quotidienne (GitHub Actions + AWS Lambda).

## Schéma

```text
Developers
    │ push / PR
    ▼
GitHub Actions
├─ Quality gate ── typecheck / tests / build / audit SEO statique
├─ Deploy production (OIDC) ──▶ AWS Amplify Hosting (Next.js SSR)
│                                 │
│                                 ├─ smoke SEO (seo:agent)
│                                 └─ IndexNow notify
├─ SEO monitor (cron 05:17 UTC) ── audit live + issue GitHub
└─ Infra GitOps ── package Lambda ── terraform plan/apply
                                      │
                                      ▼
                         AWS seo-monitor stack (eu-west-3)
                         ├─ EventBridge schedule (daily)
                         ├─ Lambda arm64 256 Mo (audit technique)
                         ├─ S3 reports (chiffré, privé, TTL 90 j)
                         ├─ SNS e-mail + CloudWatch alarm
                         └─ AWS Budgets ($5 soft limit)
```

## Choix de services

| Besoin | Service | Pourquoi |
| --- | --- | --- |
| App SSR | Amplify Hosting | Compatible Next.js 15 SSR, Git-connected, TLS géré, free tier débutant |
| Auth CI→AWS | IAM OIDC | Pas de clés statiques |
| Audit daily externe | EventBridge + Lambda | Indépendant de GitHub ; free forever à ce volume |
| Stockage rapports | S3 | Pennies / free tier ; lifecycle automatique |
| Alertes | SNS + CloudWatch | E-mail confirmé, alarme sur erreurs Lambda |
| Garde-fou coût | AWS Budgets | Alerte 80 % forecast + 100 % actual |

## Estimation coût (faible trafic)

| Poste | Ordre de grandeur |
| --- | --- |
| Lambda 1×/jour × ~60 s × 256 Mo | ≪ free tier (1 M req + 400 k GB-s) |
| EventBridge | ≪ free tier |
| S3 rapports JSON | < 0,01 $/mois |
| SNS e-mails | free tier (1 000 / mois) |
| Amplify | free tier 12 mois puis variable (builds + SSR) |
| **Cible** | **0–5 $/mois** avec budget soft à 5 $ |

AWS ne garantit pas une facture nulle hors quotas. Amplify dépend du trafic et des builds.

## Automatisation SEO

1. **Statique (PR)** : `npm run audit:seo` + briefs.
2. **Post-deploy** : `seo:agent` sur `PRODUCTION_URL` + IndexNow.
3. **Daily GitHub** : même agent, ouverture d’issue incident.
4. **Daily AWS** : même cœur `scripts/seo-core.mjs` packagé dans la Lambda, rapports S3, SNS si échec.

Seuils partagés : `seo.limits.json`.

## Fichiers clés

- `amplify.yml` — build Amplify
- `infra/seo-monitor/` — Terraform du moniteur
- `scripts/seo-core.mjs` — moteur d’audit partagé
- `GITOPS.md` — runbook variables / IAM
