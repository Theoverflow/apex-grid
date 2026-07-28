# Apex Grid

Starter de plateforme éditoriale de courses automobiles au design premium, construit avec Next.js 15 et prêt pour AWS Amplify Hosting SSR.

Architecture automatisée free-tier : voir [`ARCHITECTURE.md`](./ARCHITECTURE.md) et [`GITOPS.md`](./GITOPS.md).

## Fonctionnalités

- Rendu serveur et génération statique hybride.
- Routes dynamiques pour événements, équipes et articles.
- Métadonnées uniques, canonicals, Open Graph et Twitter Cards.
- `robots.txt` et sitemap générés par Next.js.
- JSON-LD Organization, WebSite, BreadcrumbList, SportsEvent et Article.
- Recherche interne `noindex`.
- 404 réelle, endpoint de santé et headers de sécurité.
- Design responsive, accessibilité clavier et réduction des animations.
- Tests unitaires, E2E et audit SEO statique.
- Pipeline GitHub Actions + Amplify + moniteur SEO AWS quotidien.

## Démarrage

```bash
cp .env.example .env.local
npm install --no-audit --no-fund
npm run dev
```

Ouvrir `http://localhost:3000`.

## Vérification complète

```bash
npm run check
npm run test:e2e
```

## Déploiement AWS Amplify Hosting

1. Créer un dépôt GitHub et pousser ce projet.
2. Dans AWS Amplify Hosting, sélectionner **New app > Host web app**.
3. Connecter le dépôt et conserver `amplify.yml`.
4. Ajouter les variables :
   - `NEXT_PUBLIC_SITE_URL=https://www.votredomaine.fr`
   - `NEXT_PUBLIC_SITE_NAME=Votre marque`
5. Associer le domaine personnalisé et laisser Amplify gérer le certificat TLS.
6. Après déploiement, tester `/robots.txt`, `/sitemap.xml`, une route dynamique et `/api/health`.

AWS Amplify détecte les applications Next.js SSR et les déploie sur son compute géré. Le starter reste sur Next.js 15.5.9 (patches sécurité RSC / CVE-2025-66478 et suivantes).

## Renforcement AWS production

- Activer les journaux d’accès et les alarmes d’erreurs 5xx.
- Ajouter AWS WAF avec les groupes gérés Core Rule Set et Known Bad Inputs si l’architecture de distribution choisie permet l’association du Web ACL.
- Activer AWS Shield Standard, inclus avec les services compatibles.
- Restreindre les permissions IAM du pipeline.
- Stocker les secrets dans AWS Secrets Manager ou Parameter Store, jamais dans Git.
- Ajouter Route 53 DNSSEC si approprié.
- Définir des budgets AWS et des alarmes de coûts (déjà provisionnés dans `infra/seo-monitor`).
- Sauvegarder la source métier dans une base managée avec PITR si un CMS/API est ajouté.

## Passage à des données réelles

Remplacer `lib/data.ts` par une couche repository connectée à un CMS headless ou à une API. Conserver les mêmes types de retour et garantir :

- URL et slugs stables ;
- dates ISO 8601 ;
- contenu visible cohérent avec le JSON-LD ;
- invalidation/revalidation après publication ;
- suppression des URL expirées du sitemap ;
- statuts 404/410 corrects.

## Points à personnaliser avant production

- Domaine, e-mail, réseaux sociaux et identité légale.
- Politique de confidentialité validée juridiquement.
- Données éditoriales et calendrier officiels.
- Image OG rasterisée en 1200 × 630 si les plateformes sociales ciblées gèrent mal SVG.
- CSP stricte adaptée aux domaines réellement utilisés.
- Consentement et analytics selon la juridiction.

## Fondation vibe-code vérifiée

Le repository suit le modèle **Vercel shadcn/ui Registry Starter**, conçu pour les design systems AI-native : App Router, composants en code ouvert, aliases agent-friendly et manifeste `components.json`. Consultez `VIBE_TEMPLATE.md` et `AGENTS.md`. Le design automobile reste original et ne redistribue aucun template premium.

## Robot SEO automatisé (IA, draft-only)

Le robot n'achète pas de liens et ne crée pas de pages satellites. Il audite, score et propose des drafts :

```bash
npm run seo:ai:offline
BASE_URL=https://www.votredomaine.fr npm run seo:ai
```

Sorties dans `reports/` :

- `seo-report.*` — audit technique live (titres, canonicals, H1, JSON-LD, OG, alts, orphelines, liens cassés)
- `content-briefs.*` / `seo-outlines.*` — briefs et plans éditoriaux
- `seo-meta-drafts.*` — titres/descriptions suggérés
- `seo-internal-links.*` — maillage interne suggéré
- `seo-schema-hints.*` — types JSON-LD manquants
- `seo-regression.*` — diff vs audit précédent
- `seo-ai-suite.*` — journal d’orchestration

LLM optionnel : `SEO_AI_PROVIDER` + `SEO_AI_API_KEY`. Sans clé, les heuristiques locales restent actives.

Double surveillance quotidienne lorsque `PRODUCTION_URL` est défini :

- `.github/workflows/seo-monitor.yml` — suite AI complète + issue GitHub
- `infra/seo-monitor` — Lambda EventBridge externe, rapports S3, SNS

Seuils : `seo.limits.json`. Routes obligatoires : `seo.routes.json`. Moteur : `scripts/seo-core.mjs`.


## IndexNow

Définir `INDEXNOW_KEY` dans AWS Amplify / GitHub secrets, puis exécuter après une publication importante :

```bash
INDEXNOW_HOST=www.votredomaine.fr \
INDEXNOW_KEY=... \
SITEMAP_URL=https://www.votredomaine.fr/sitemap.xml \
npm run seo:indexnow
```

La clé est exposée par `/indexnow-key.txt`. Les soumissions doivent correspondre à de véritables créations, mises à jour ou suppressions.

## Ciblage éditorial

Les expressions **Apex Grid**, **luxe race** et **racing apex** sont traitées comme des thèmes de marque et d'univers éditorial, jamais comme des mots-clés à répéter mécaniquement. `seo.config.mjs` centralise les intentions, destinations et seuils d'audit. Toute publication issue d'une IA doit être factuellement vérifiée avant mise en ligne.

## GitOps AWS et SEO automatisé

- `.github/workflows/quality.yml` : contrôle de chaque PR.
- `.github/workflows/infra.yml` : package Lambda + plan Terraform en PR, apply sur `main`.
- `.github/workflows/deploy-production.yml` : déploiement Amplify après validation.
- `.github/workflows/seo-monitor.yml` : audit applicatif quotidien et incidents GitHub.
- `.github/workflows/seo-ai-daily-commit.yml` : suite SEO IA daily + commit/push de `reports/latest/`.
- `infra/seo-monitor` : second contrôle externe AWS quotidien, rapports S3 et alertes SNS.
- `.cursor/prompts/daily-seo-ai-agent.md` : prompt prêt pour une Automation Cursor (Agents Window).

Cette double surveillance détecte les régressions même lorsqu'un système de CI ou un fournisseur rencontre une panne.
