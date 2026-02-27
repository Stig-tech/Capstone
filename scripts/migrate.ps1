
$ErrorActionPreference = "Stop"

$dbHost = "localhost"
$dbPort = 5432
$dbUser = "postgres"
$dbName = "Capstone"

Write-Host "Running migrations against $dbName..."

Get-ChildItem ".\database\migrations\*.sql" |
  Sort-Object Name |
  ForEach-Object {
    Write-Host "Applying $($_.Name)..."
    psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -v ON_ERROR_STOP=1 -f $_.FullName
    if ($LASTEXITCODE -ne 0) { throw "Migration failed: $($_.Name)" }
  }

Write-Host "Done."