<#
  sadece-tasarim :: Photoshop ya da Illustrator'da .jsx calistirir (COM; ekran kontrolu gerekmez).
  - Betigi UTF-8 okur, ASCII disi karakterleri \uXXXX'e cevirip yanina gecici _ascii_<ad>.jsx yazar.
    ExtendScript UTF-8 ve BOM'u guvenilir okumaz; boylece Turkce metin bozulmaz, #include yollari da calisir.
  - Uygulama kapaliysa acar. Betigin son ifadesinin degerini (SD.run / AI.run sonucu) ekrana basar.
  Kullanim:
    powershell -NoProfile -ExecutionPolicy Bypass -File run_jsx.ps1 -Script "C:\proje\_script\build.jsx"
    powershell -NoProfile -ExecutionPolicy Bypass -File run_jsx.ps1 -App illustrator -Script "...\logo.jsx"
    -JsxArgs "a|b"  -> betikte SD_ARGS[0], SD_ARGS[1] ('|' ile ayir; -File modunda dizi gecmez.
                       Basa tek satir eklenir, hata satir numarasi 1 kayar)
  Not: Photoshop arka planda/Ana Ekran'dayken documents.add "Hata 8800 ... yeterince yer yok" verir;
  bu yuzden calistirmadan once uygulama penceresi one getirilir.
#>
param(
  [Parameter(Mandatory = $true)][string]$Script,
  [ValidateSet('photoshop', 'illustrator')][string]$App = 'photoshop',
  [string]$JsxArgs = ''
)
$ErrorActionPreference = 'Stop'
$src = (Resolve-Path -LiteralPath $Script).Path
$text = [IO.File]::ReadAllText($src, [Text.Encoding]::UTF8)
$sb = New-Object Text.StringBuilder
if ($JsxArgs) {
  # COM arguman dizisi Photoshop'ta 'Desteklenmeyen Varyant' hatasi veriyor; argumanlari betigin basina gomuyoruz
  $q = $JsxArgs.Split('|') | ForEach-Object { '"' + ($_.Replace([string][char]92, '/').Replace('"', "'")) + '"' }
  [void]$sb.Append('var SD_ARGS = [' + ($q -join ',') + '];' + "`n")
}
foreach ($ch in $text.ToCharArray()) {
  $n = [int]$ch
  if ($n -gt 127) { [void]$sb.Append('\u' + $n.ToString('X4')) } else { [void]$sb.Append($ch) }
}
$dir = Split-Path -Parent $src
$tmp = Join-Path $dir ('_ascii_' + (Split-Path -Leaf $src))
[IO.File]::WriteAllText($tmp, $sb.ToString(), (New-Object Text.ASCIIEncoding))

$progId = if ($App -eq 'illustrator') { 'Illustrator.Application' } else { 'Photoshop.Application' }
try {
  $adobe = New-Object -ComObject $progId
  $procName = if ($App -eq 'illustrator') { 'Illustrator' } else { 'Photoshop' }
  $p = Get-Process $procName -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if ($p) { [void](New-Object -ComObject WScript.Shell).AppActivate($p.Id); Start-Sleep -Milliseconds 400 }
  $res = $adobe.DoJavaScriptFile($tmp)
  if ($null -ne $res) { Write-Output $res }
} finally {
  Remove-Item -LiteralPath $tmp -ErrorAction SilentlyContinue
}
