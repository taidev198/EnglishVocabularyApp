# Quick script to get your local IP address for mobile access
Write-Host "=== Finding Your Local IP Address ===" -ForegroundColor Cyan
Write-Host ""

$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { 
        $_.IPAddress -notlike "127.*" -and 
        $_.IPAddress -notlike "169.254.*" 
    } | 
    Select-Object IPAddress, InterfaceAlias

if ($ipAddresses) {
    Write-Host "Your local IP addresses:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($ip in $ipAddresses) {
        Write-Host "  IP: $($ip.IPAddress)" -ForegroundColor Green
        Write-Host "  Interface: $($ip.InterfaceAlias)" -ForegroundColor Gray
        Write-Host ""
    }
    
    $mainIP = $ipAddresses[0].IPAddress
    Write-Host "Access your app from mobile at:" -ForegroundColor Yellow
    Write-Host "  http://$mainIP:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Make sure both devices are on the same Wi-Fi network!" -ForegroundColor Yellow
} else {
    Write-Host "Could not find local IP address." -ForegroundColor Red
    Write-Host "Make sure you're connected to a Wi-Fi network." -ForegroundColor Yellow
}

