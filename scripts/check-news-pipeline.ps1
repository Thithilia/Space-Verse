param(
  [string]$SupabaseUrl = $env:SUPABASE_URL,
  [string]$NewsFunctionSecret = $env:NEWS_FUNCTION_SECRET,
  [string]$SupabaseAnonKey = $env:SUPABASE_ANON_KEY
)

$ErrorActionPreference = "Stop"

if (-not $SupabaseUrl) {
  throw "SUPABASE_URL is required."
}

if (-not $NewsFunctionSecret) {
  throw "NEWS_FUNCTION_SECRET is required."
}

if (-not $SupabaseAnonKey) {
  throw "SUPABASE_ANON_KEY is required because the functions verify JWTs."
}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$headers = @{
  "Content-Type" = "application/json"
}
$headers["apikey"] = $SupabaseAnonKey
$headers["Authorization"] = "Bearer $SupabaseAnonKey"
$headers["x-spaceverse-secret"] = $NewsFunctionSecret

$functions = @(
  "sync-news",
  "draft-news",
  "export-static-news"
)

foreach ($functionName in $functions) {
  $uri = "$SupabaseUrl/functions/v1/$functionName"
  Write-Host ""
  Write-Host "POST $uri"
  try {
    $response = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -TimeoutSec 90
    $response | ConvertTo-Json -Depth 8
  } catch {
    Write-Host "FAILED: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
      Write-Host $_.ErrorDetails.Message
    }
  }
}
