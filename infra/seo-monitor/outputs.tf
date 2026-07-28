output "lambda_name" {
  value       = aws_lambda_function.seo_monitor.function_name
  description = "SEO monitor Lambda function name."
}

output "lambda_arn" {
  value       = aws_lambda_function.seo_monitor.arn
  description = "SEO monitor Lambda ARN."
}

output "report_bucket" {
  value       = aws_s3_bucket.reports.bucket
  description = "Private S3 bucket for daily SEO JSON reports."
}

output "alert_topic_arn" {
  value       = aws_sns_topic.alerts.arn
  description = "SNS topic for SEO and CloudWatch alerts."
}

output "schedule" {
  value       = aws_cloudwatch_event_rule.daily.schedule_expression
  description = "EventBridge cron for the daily audit."
}

output "budget_name" {
  value       = aws_budgets_budget.monthly.name
  description = "AWS Budgets soft cost guardrail."
}
