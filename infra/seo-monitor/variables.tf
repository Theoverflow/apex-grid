variable "aws_region" { type = string default = "eu-west-3" }
variable "project_name" { type = string default = "apex-grid" }
variable "production_url" { type = string }
variable "alert_email" { type = string default = "" }
variable "schedule_expression" { type = string default = "cron(17 5 * * ? *)" }
variable "report_retention_days" { type = number default = 90 }
variable "monthly_budget_usd" { type = number default = 5 }
