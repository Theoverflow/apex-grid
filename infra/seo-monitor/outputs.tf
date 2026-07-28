output "lambda_name" { value = aws_lambda_function.seo_monitor.function_name }
output "report_bucket" { value = aws_s3_bucket.reports.bucket }
output "alert_topic_arn" { value = aws_sns_topic.alerts.arn }
