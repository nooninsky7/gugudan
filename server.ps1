$port = 8080
$prefix = "http://*:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host " [구구단 탐험대] 태블릿 연결용 로컬 서버 실행 중" -ForegroundColor Cyan
    Write-Host " 태블릿 브라우저(Safari, Chrome) 주소창에 아래를 입력하세요:" -ForegroundColor Yellow
    Write-Host " http://192.168.45.228:$port" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host " (종료하려면 이 창을 닫거나 Ctrl+C를 누르세요)" -ForegroundColor Gray
    Write-Host "==========================================" -ForegroundColor Green

    $baseDir = $PSScriptRoot
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        $filePath = Join-Path $baseDir $urlPath.TrimStart('/')

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} catch {
    Write-Host "서버 실행 중 오류 발생: $_" -ForegroundColor Red
} finally {
    $listener.Stop()
}
