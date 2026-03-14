Add-Type -AssemblyName System.Drawing

function New-ForgeMotionIcon {
  param(
    [int]$Size,
    [string]$Path,
    [bool]$Maskable = $false
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::FromArgb(17, 22, 34))

  if (-not $Maskable) {
    $haloInset = [int]($Size * 0.08)
    $haloBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(36, 42, 58))
    $graphics.FillEllipse($haloBrush, $haloInset, $haloInset, $Size - ($haloInset * 2), $Size - ($haloInset * 2))
    $haloBrush.Dispose()
  }

  $inset = if ($Maskable) { [int]($Size * 0.14) } else { [int]($Size * 0.2) }
  $coreBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 34, 48))
  $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 213, 79))
  $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 245, 238))

  $graphics.FillEllipse($coreBrush, $inset, $inset, $Size - ($inset * 2), $Size - ($inset * 2))

  $barWidth = [int]($Size * 0.42)
  $barHeight = [int]($Size * 0.075)
  $barX = [int](($Size - $barWidth) / 2)
  $barY = [int]($Size * 0.7)
  $graphics.FillRectangle($accentBrush, $barX, $barY, $barWidth, $barHeight)

  $fontSize = [float]($Size * 0.34)
  $font = New-Object System.Drawing.Font "Segoe UI", $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $stringFormat = New-Object System.Drawing.StringFormat
  $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
  $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textRect = New-Object System.Drawing.RectangleF 0, 0, $Size, ($Size * 0.72)
  $graphics.DrawString("F", $font, $textBrush, $textRect, $stringFormat)

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

  $stringFormat.Dispose()
  $font.Dispose()
  $textBrush.Dispose()
  $accentBrush.Dispose()
  $coreBrush.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-ForgeMotionIcon -Size 192 -Path "public/icon-192.png"
New-ForgeMotionIcon -Size 512 -Path "public/icon-512.png"
New-ForgeMotionIcon -Size 512 -Path "public/icon-512-maskable.png" -Maskable $true
New-ForgeMotionIcon -Size 180 -Path "public/apple-touch-icon.png"
