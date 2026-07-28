import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { auditSite, loadLimits } from './seo-core.mjs';

const s3 = new S3Client({});
const sns = new SNSClient({});
const here = dirname(fileURLToPath(import.meta.url));

export const handler = async () => {
  const baseUrl = (process.env.BASE_URL || '').replace(/\/$/, '');
  if (!baseUrl) throw new Error('BASE_URL is required');

  const limits = loadLimits(join(here, 'seo.limits.json'));
  let requiredRoutes = ['/', '/championships', '/robots.txt', '/sitemap.xml', '/api/health'];
  try {
    requiredRoutes = JSON.parse(readFileSync(join(here, 'seo.routes.json'), 'utf8'));
  } catch {
    /* keep defaults */
  }

  const report = await auditSite(baseUrl, {
    limits: {
      ...limits,
      maxUrls: Number(process.env.MAX_URLS || limits.maxUrls),
      requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || limits.requestTimeoutMs)
    },
    requiredRoutes,
    userAgent: 'ApexGridSEOHealthBot/1.0 (+https://apex-grid.fr/bot)'
  });

  const key = `seo-reports/${report.startedAt.slice(0, 10)}/${Date.now()}.json`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.REPORT_BUCKET,
      Key: key,
      Body: JSON.stringify(report, null, 2),
      ContentType: 'application/json'
    })
  );

  if (report.failed && process.env.ALERT_TOPIC_ARN) {
    await sns.send(
      new PublishCommand({
        TopicArn: process.env.ALERT_TOPIC_ARN,
        Subject: 'Apex Grid SEO audit failed',
        Message: JSON.stringify(
          {
            key,
            bucket: process.env.REPORT_BUCKET,
            globalIssues: report.globalIssues,
            warnings: report.warnings.slice(0, 20),
            failedPages: report.failedPages.slice(0, 20)
          },
          null,
          2
        )
      })
    );
  }

  if (report.failed) {
    throw new Error(`SEO audit failed; report s3://${process.env.REPORT_BUCKET}/${key}`);
  }

  return {
    ok: true,
    key,
    urlsChecked: report.urlsChecked,
    warnings: report.warnings.length
  };
};
