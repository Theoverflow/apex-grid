data "archive_file" "seo_monitor" {
  type        = "zip"
  source_file = "${path.module}/lambda/index.mjs"
  output_path = "${path.module}/seo-monitor.zip"
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "reports" {
  bucket_prefix = "${var.project_name}-seo-reports-"
  force_destroy = false
  tags = { Project = var.project_name, ManagedBy = "Terraform" }
}
resource "aws_s3_bucket_public_access_block" "reports" {
  bucket = aws_s3_bucket.reports.id
  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_server_side_encryption_configuration" "reports" {
  bucket = aws_s3_bucket.reports.id
  rule { apply_server_side_encryption_by_default { sse_algorithm = "AES256" } }
}
resource "aws_s3_bucket_lifecycle_configuration" "reports" {
  bucket = aws_s3_bucket.reports.id
  rule {
    id = "expire-reports"
    status = "Enabled"
    expiration { days = var.report_retention_days }
  }
}

resource "aws_sns_topic" "alerts" { name = "${var.project_name}-seo-alerts" }
resource "aws_sns_topic_subscription" "email" {
  count = var.alert_email == "" ? 0 : 1
  topic_arn = aws_sns_topic.alerts.arn
  protocol = "email"
  endpoint = var.alert_email
}

resource "aws_iam_role" "lambda" {
  name_prefix = "${var.project_name}-seo-lambda-"
  assume_role_policy = jsonencode({ Version="2012-10-17", Statement=[{Effect="Allow",Principal={Service="lambda.amazonaws.com"},Action="sts:AssumeRole"}] })
}
resource "aws_iam_role_policy" "lambda" {
  role = aws_iam_role.lambda.id
  policy = jsonencode({ Version="2012-10-17", Statement=[
    {Effect="Allow",Action=["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],Resource="arn:aws:logs:*:*:*"},
    {Effect="Allow",Action=["s3:PutObject"],Resource="${aws_s3_bucket.reports.arn}/*"},
    {Effect="Allow",Action=["sns:Publish"],Resource=aws_sns_topic.alerts.arn}
  ]})
}
resource "aws_lambda_function" "seo_monitor" {
  function_name = "${var.project_name}-seo-monitor"
  role = aws_iam_role.lambda.arn
  handler = "index.handler"
  runtime = "nodejs20.x"
  filename = data.archive_file.seo_monitor.output_path
  source_code_hash = data.archive_file.seo_monitor.output_base64sha256
  memory_size = 256
  timeout = 120
  reserved_concurrent_executions = 1
  environment { variables = {
    BASE_URL = var.production_url
    REPORT_BUCKET = aws_s3_bucket.reports.bucket
    ALERT_TOPIC_ARN = aws_sns_topic.alerts.arn
    MAX_URLS = "100"
    REQUEST_TIMEOUT_MS = "10000"
  }}
  tags = { Project = var.project_name, ManagedBy = "Terraform" }
}
resource "aws_cloudwatch_log_group" "seo_monitor" {
  name = "/aws/lambda/${aws_lambda_function.seo_monitor.function_name}"
  retention_in_days = 14
}
resource "aws_cloudwatch_event_rule" "daily" {
  name = "${var.project_name}-daily-seo-monitor"
  schedule_expression = var.schedule_expression
}
resource "aws_cloudwatch_event_target" "lambda" {
  rule = aws_cloudwatch_event_rule.daily.name
  arn = aws_lambda_function.seo_monitor.arn
}
resource "aws_lambda_permission" "eventbridge" {
  statement_id = "AllowEventBridge"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.seo_monitor.function_name
  principal = "events.amazonaws.com"
  source_arn = aws_cloudwatch_event_rule.daily.arn
}

resource "aws_budgets_budget" "monthly" {
  name = "${var.project_name}-monthly-cost"
  budget_type = "COST"
  limit_amount = tostring(var.monthly_budget_usd)
  limit_unit = "USD"
  time_unit = "MONTHLY"
  cost_filter { name = "TagKeyValue" values = ["user:Project$${var.project_name}"] }
  dynamic "notification" {
    for_each = var.alert_email == "" ? [] : [1]
    content {
      comparison_operator = "GREATER_THAN"
      threshold = 80
      threshold_type = "PERCENTAGE"
      notification_type = "FORECASTED"
      subscriber_email_addresses = [var.alert_email]
    }
  }
}
