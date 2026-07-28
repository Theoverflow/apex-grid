variable "aws_region" {
  type        = string
  default     = "eu-west-3"
  description = "AWS region for the free-tier SEO monitor stack."
}

variable "project_name" {
  type        = string
  default     = "apex-grid"
  description = "Name prefix for AWS resources."
}

variable "production_url" {
  type        = string
  description = "Canonical production site URL audited daily."

  validation {
    condition     = can(regex("^https://", var.production_url))
    error_message = "production_url must start with https://"
  }
}

variable "alert_email" {
  type        = string
  default     = ""
  description = "Optional email for SNS SEO and budget alerts."
}

variable "schedule_expression" {
  type        = string
  default     = "cron(17 5 * * ? *)"
  description = "EventBridge schedule (default daily 05:17 UTC)."
}

variable "report_retention_days" {
  type        = number
  default     = 90
  description = "S3 report expiration in days."
}

variable "monthly_budget_usd" {
  type        = number
  default     = 5
  description = "AWS Budgets monthly soft limit for forecast alerts."
}

variable "lambda_memory_mb" {
  type        = number
  default     = 256
  description = "Lambda memory. Keep low for free-tier GB-seconds."
}

variable "lambda_timeout_seconds" {
  type        = number
  default     = 120
  description = "Lambda timeout for full sitemap crawl."
}
