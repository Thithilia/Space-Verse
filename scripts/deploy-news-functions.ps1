param(
  [string]$ProjectRef = "ktahawkoxwcdjrhkpgxv",
  [string]$SupabaseCliPackage = "supabase@2.98.2"
)

$ErrorActionPreference = "Stop"

$functions = @(
  "sync-news",
  "draft-news",
  "export-static-news"
)

Write-Host "Deploying Space-Verse news functions to project $ProjectRef"
Write-Host "Supabase CLI auth must already be available via 'supabase login' or SUPABASE_ACCESS_TOKEN."
Write-Host "Using pinned Supabase CLI package $SupabaseCliPackage"

foreach ($functionName in $functions) {
  Write-Host ""
  Write-Host "Deploying $functionName..."
  npx --yes $SupabaseCliPackage functions deploy $functionName --project-ref $ProjectRef
}

Write-Host ""
Write-Host "Done. Set required secrets in Supabase before running the pipeline:"
Write-Host "  SUPABASE_URL"
Write-Host "  SUPABASE_SERVICE_ROLE_KEY"
Write-Host "  OPENAI_API_KEY"
Write-Host "  NEWS_FUNCTION_SECRET"
