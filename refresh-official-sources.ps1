$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonOutputPath = Join-Path $root "live-refresh-data.json"
$jsOutputPath = Join-Path $root "live-refresh-data.js"
$runTimestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")

$adapters = @(
  @{
    Id = "alta"
    Name = "Alta Ski Area"
    Url = "https://www.skiutah.com/members/alta/snowreport"
    Patterns = @{
      Overnight = "overnight\s*([0-9]+)"
      Snow24 = "24\s*hours\s*([0-9]+)"
      Snow48 = "48\s*hours\s*([0-9]+)"
      Snow7 = "7\s*days\s*([0-9]+)"
      Base = "base total\s*([0-9]+)"
      Season = "year to date\s*([0-9]+)"
      Updated = "Updated\s*([0-9:+\-\sT]+)"
    }
  }
  @{
    Id = "big-sky"
    Name = "Big Sky Resort"
    Url = "https://www.onthesnow.com/montana/big-sky-resort/skireport"
    Patterns = @{
      Snow24 = "24 hour snow[^0-9]*([0-9]+(?:\\.[0-9]+)?)"
      Base = "Base depth[^0-9]*([0-9]+(?:\\.[0-9]+)?)"
      Trails = "Runs open[^0-9]*([0-9]+)[^0-9]+([0-9]+)"
      Lifts = "Lifts open[^0-9]*([0-9]+)[^0-9]+([0-9]+)"
      Updated = "Last Updated[^A-Za-z0-9]*([A-Za-z]{3,9}\s+[0-9]{1,2},?\s+[0-9]{4})"
    }
  }
  @{
    Id = "snowbasin"
    Name = "Snowbasin"
    Url = "https://www.snowbasin.com/the-mountain/mountain-report/"
    Patterns = @{
      Overnight = "Overnight\s*([0-9]+)"
      Snow24 = "24 hours\s*([0-9]+)"
      Snow7 = "7 days\s*([0-9]+)"
      Base = "Base\s*([0-9]+)"
      Season = "Season\s*([0-9]+)"
      Trails = "Trails Open\s*([0-9]+)\s*/\s*([0-9]+)"
      Lifts = "Lifts Open\s*([0-9]+)\s*/\s*([0-9]+)"
      Updated = "Last Updated:\s*([A-Za-z]{3,9}\s+[0-9]{1,2}[^<\r\n]+MT)"
    }
  }
  @{
    Id = "snowbird"
    Name = "Snowbird"
    Url = "https://www.skiutah.com/members/snowbird/snowreport"
    Patterns = @{
      Overnight = "overnight\s*([0-9]+)"
      Snow24 = "24\s*hours\s*([0-9]+)"
      Snow48 = "48\s*hours\s*([0-9]+)"
      Snow7 = "7\s*days\s*([0-9]+)"
      Base = "base total\s*([0-9]+)"
      Season = "year to date\s*([0-9]+)"
      Updated = "Updated\s*([0-9:+\-\sT]+)"
    }
  }
  @{
    Id = "grand-targhee"
    Name = "Grand Targhee Resort"
    Url = "https://www.grandtarghee.com/the-mountain/cams-conditions/mountain-report"
    Patterns = @{
      Overnight = "Overnight\s*([0-9]+)"
      Snow24 = "24 HR\s*([0-9]+)"
      Snow48 = "48 HR\s*([0-9]+)"
      Base = "Base Depth\s*([0-9]+)"
      Season = "Season\s*([0-9]+)"
      Lifts = "Lifts\s*([0-9]+)\s*/\s*([0-9]+)"
      Trails = "Trails\s*([0-9]+)\s*/\s*([0-9]+)"
      Updated = "Updated Daily at\s*([0-9:apmAPM ]+)"
    }
  }
  @{
    Id = "sun-valley"
    Name = "Sun Valley"
    Url = "https://www.sunvalley.com/the-mountain/mountain-report/"
    Patterns = @{
      Overnight = "Overnight\s*([0-9]+)"
      Snow24 = "24 hours\s*([0-9]+)"
      Snow7 = "7 days\s*([0-9]+)"
      Base = "Base\s*([0-9]+)"
      Season = "Season\s*([0-9]+)"
      Lifts = "Lifts Open\s*([0-9]+)\s*/\s*([0-9]+)"
      Trails = "Trails Open\s*([0-9]+)\s*/\s*([0-9]+)"
      Updated = "Last Updated:\s*([A-Za-z]{3,9}\s+[0-9]{1,2}[^<\r\n]+MT)"
    }
  }
  @{
    Id = "sugarloaf"
    Name = "Sugarloaf"
    Url = "https://www.sugarloaf.com/mountain-report"
    Patterns = @{
      Snow24 = "24\s*Hour\s*([0-9]+)"
      Snow7 = "Weekly\s*([0-9]+)"
      Season = "(?:YTD|Year to Date)\s*([0-9]+)"
      Updated = "Last Updated:\s*([0-9/:\sAPMapm]+)"
    }
  }
  @{
    Id = "sunday-river"
    Name = "Sunday River"
    Url = "https://www.sundayriver.com/mountain-report"
    Patterns = @{
      Snow24 = "24\s*hours?\s*([0-9]+)"
      Snow48 = "48\s*hours?\s*([0-9]+)"
      Snow72 = "72\s*hours?\s*([0-9]+)"
      Base = "Base\s*([0-9]+)"
      Trails = "Trails Open\s*([0-9]+)\s*/\s*([0-9]+)"
      Lifts = "Lifts Open\s*([0-9]+)\s*/\s*([0-9]+)"
      Updated = "Last Updated:\s*([A-Za-z]{3,9}\s+[0-9]{1,2}[^<\r\n]+)"
    }
  }
  @{
    Id = "taos"
    Name = "Taos Ski Valley"
    Url = "https://www.skitaos.com/lifts?section=weather-forecast"
    Patterns = @{
      Snow24 = "24\s*Hours\s*([0-9]+)"
      Snow48 = "48\s*Hours\s*([0-9]+)"
      Snow72 = "72\s*Hours\s*([0-9]+)"
      Snow7 = "7\s*Day\s*([0-9]+)"
      Base = "Base Depth\s*([0-9]+)"
      Lifts = "Lifts\s*([0-9]+)\s*/\s*([0-9]+)"
      Trails = "Slopes\s*([0-9]+)\s*/\s*([0-9]+)"
      Updated = "Last updated:\s*([^<\r\n]+)"
    }
  }
  @{
    Id = "jackson-hole"
    Name = "Jackson Hole Mountain Resort"
    Url = "https://www.jacksonhole.com/mountain-report"
    Patterns = @{
      Since6 = "SINCE 6AM\s*([0-9]+)"
      Overnight = "OVERNIGHT\s*([0-9]+)"
      Snow48 = "48 HOURS\s*([0-9]+)"
      Depth = "SNOW DEPTH\s*([0-9]+)"
      Updated = "Last Updated:\s*([A-Za-z]{3,9}\s+[0-9]{1,2}[^<\r\n]+)"
    }
  }
)

function Get-FirstMatchValue {
  param(
    [string]$Text,
    [string]$Pattern
  )

  if ([string]::IsNullOrWhiteSpace($Pattern)) {
    return $null
  }

  $match = [regex]::Match($Text, $Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if (-not $match.Success) {
    return $null
  }

  if ($match.Groups.Count -gt 2 -and $match.Groups[2].Value) {
    return @($match.Groups[1].Value, $match.Groups[2].Value)
  }

  return $match.Groups[1].Value
}

function Convert-ToNullableNumber {
  param($Value)

  if ($null -eq $Value) {
    return $null
  }

  if ($Value -is [array]) {
    return $Value
  }

  $clean = "$Value" -replace '[^0-9\.]', ''
  if ([string]::IsNullOrWhiteSpace($clean)) {
    return $null
  }

  return [double]$clean
}

function Convert-ResultToLiveResort {
  param($Result)

  if ($Result.error) {
    return [ordered]@{
      sourceUpdatedAt = "Refresh failed"
      sourceNotes = "Refresh pipeline could not fetch the official resort page: $($Result.error)"
      officialStats = @{}
    }
  }

  $updatedAt = if ($Result.updatedAt) {
    $Result.updatedAt
  }
  else {
    "Fetched $($Result.fetchedAt); resort timestamp unavailable"
  }

  $stats = [ordered]@{}

  if ($null -ne $Result.overnight) { $stats.overnightSnowfall = Convert-ToNullableNumber $Result.overnight }
  if ($null -ne $Result.snowfallSince6am) { $stats.since6amSnowfall = Convert-ToNullableNumber $Result.snowfallSince6am }
  if ($null -ne $Result.snowfall24Hours) { $stats.snowfall24Hours = Convert-ToNullableNumber $Result.snowfall24Hours }
  if ($null -ne $Result.snowfall48Hours) { $stats.snowfall48Hours = Convert-ToNullableNumber $Result.snowfall48Hours }
  if ($null -ne $Result.snowfall72Hours) { $stats.snowfall72Hours = Convert-ToNullableNumber $Result.snowfall72Hours }
  if ($null -ne $Result.snowfall7Days) { $stats.snowfall7Days = Convert-ToNullableNumber $Result.snowfall7Days }
  if ($null -ne $Result.baseDepth) {
    $base = Convert-ToNullableNumber $Result.baseDepth
    $stats.baseDepthMin = $base
    $stats.baseDepthMax = $base
  }
  if ($null -ne $Result.seasonSnowfall) { $stats.seasonSnowfall = Convert-ToNullableNumber $Result.seasonSnowfall }
  if ($Result.trails -is [array]) {
    $stats.trailsOpen = Convert-ToNullableNumber $Result.trails[0]
    $stats.trailsTotal = Convert-ToNullableNumber $Result.trails[1]
  }
  if ($Result.lifts -is [array]) {
    $stats.liftsOpen = Convert-ToNullableNumber $Result.lifts[0]
    $stats.liftsTotal = Convert-ToNullableNumber $Result.lifts[1]
  }

  return [ordered]@{
    sourceUpdatedAt = $updatedAt
    sourceNotes = "Live refresh pipeline fetched the official resort page on $($Result.fetchedAt)."
    officialStats = $stats
  }
}

$results = foreach ($adapter in $adapters) {
  try {
    $response = Invoke-WebRequest -Uri $adapter.Url -UseBasicParsing
    $text = $response.Content

    [pscustomobject]@{
      id = $adapter.Id
      name = $adapter.Name
      url = $adapter.Url
      overnight = Get-FirstMatchValue -Text $text -Pattern $adapter.Patterns.Overnight
      snowfall24Hours = Get-FirstMatchValue -Text $text -Pattern $adapter.Patterns.Snow24
      snowfall48Hours = Get-FirstMatchValue -Text $text -Pattern $adapter.Patterns.Snow48
      snowfall72Hours = Get-FirstMatchValue -Text $text -Pattern $adapter.Patterns.Snow72
      snowfall7Days = Get-FirstMatchValue -Text $text -Pattern $adapter.Patterns.Snow7
      snowfallSince6am = Get-FirstMatchValue -Text $text -Pattern $adapter.Patterns.Since6
      baseDepth = Get-FirstMatchValue -Text $text -Pattern $adapter.Patterns.Base
      seasonSnowfall = Get-FirstMatchValue -Text $text -Pattern $adapter.Patterns.Season
      trails = Get-FirstMatchValue -Text $text -Pattern $adapter.Patterns.Trails
      lifts = Get-FirstMatchValue -Text $text -Pattern $adapter.Patterns.Lifts
      updatedAt = Get-FirstMatchValue -Text $text -Pattern $adapter.Patterns.Updated
      fetchedAt = $runTimestamp
    }
  }
  catch {
    [pscustomobject]@{
      id = $adapter.Id
      name = $adapter.Name
      url = $adapter.Url
      error = $_.Exception.Message
      fetchedAt = $runTimestamp
    }
  }
}

$liveResorts = [ordered]@{}
foreach ($result in $results) {
  $liveResorts[$result.id] = Convert-ResultToLiveResort -Result $result
}

$liveData = [ordered]@{
  metadata = [ordered]@{
    generatedAt = $runTimestamp
    status = "generated"
  }
  resorts = $liveResorts
}

$json = $liveData | ConvertTo-Json -Depth 8
Set-Content -Path $jsonOutputPath -Value $json -Encoding UTF8

$js = "window.liveRefreshData = $json;"
Set-Content -Path $jsOutputPath -Value $js -Encoding UTF8

Write-Host "Wrote $jsonOutputPath"
Write-Host "Wrote $jsOutputPath"
$results | ConvertTo-Json -Depth 6
