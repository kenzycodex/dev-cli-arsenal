# dev-cli-arsenal Windows PowerShell Installer
# Version: 1.0.0
# Usage: iwr -useb https://raw.githubusercontent.com/username/dev-cli-arsenal/main/scripts/install.ps1 | iex
# 
# This script installs essential CLI tools for developers on Windows
# Supports: Windows 10/11, PowerShell 5.1+, PowerShell 7+

#Requires -Version 5.1

# ==========================================
# Configuration and Constants
# ==========================================

[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$SkipSystemPackages,
    [switch]$Verbose,
    [switch]$WhatIf,
    [string]$LogFile = "$env:TEMP\dev-cli-arsenal-install.log"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Script configuration
$script:Config = @{
    Version = "1.0.0"
    Name = "dev-cli-arsenal-installer"
    RepoUrl = "https://github.com/kenzycodex/dev-cli-arsenal"
    MinNodeVersion = 16
    MinNpmVersion = 8
    MinPowerShellVersion = "5.1"
}

# Installation statistics
$script:Stats = @{
    TotalPackages = 0
    SuccessfulInstalls = 0
    FailedInstalls = 0
    SkippedInstalls = 0
    StartTime = Get-Date
}

# ==========================================
# Utility Functions
# ==========================================

function Write-ColorOutput {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Message,
        
        [Parameter(Mandatory)]
        [ValidateSet('Info', 'Success', 'Warning', 'Error', 'Header', 'Step')]
        [string]$Type,
        
        [switch]$NoNewline
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $colors = @{
        'Info'    = @{ ForegroundColor = 'Cyan'; Prefix = '[INFO]' }
        'Success' = @{ ForegroundColor = 'Green'; Prefix = '[SUCCESS]' }
        'Warning' = @{ ForegroundColor = 'Yellow'; Prefix = '[WARNING]' }
        'Error'   = @{ ForegroundColor = 'Red'; Prefix = '[ERROR]' }
        'Header'  = @{ ForegroundColor = 'Magenta'; Prefix = '[HEADER]' }
        'Step'    = @{ ForegroundColor = 'Blue'; Prefix = '[STEP]' }
    }
    
    $color = $colors[$Type]
    $output = "[$timestamp] $($color.Prefix) $Message"
    
    $writeParams = @{
        Object = $output
        ForegroundColor = $color.ForegroundColor
    }
    
    if ($NoNewline) {
        $writeParams.NoNewline = $true
    }
    
    Write-Host @writeParams
    
    # Log to file
    if ($LogFile) {
        try {
            $output | Out-File -FilePath $LogFile -Append -Encoding UTF8
        }
        catch {
            # Silently continue if logging fails
        }
    }
}

function Test-CommandExists {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Command
    )
    
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

function Test-AdminPrivileges {
    [CmdletBinding()]
    [OutputType([bool])]
    param()
    
    try {
        $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
        return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    }
    catch {
        return $false
    }
}

function Get-SystemInfo {
    [CmdletBinding()]
    [OutputType([hashtable])]
    param()
    
    $info = @{
        OSVersion = [System.Environment]::OSVersion.VersionString
        PSVersion = $PSVersionTable.PSVersion.ToString()
        Architecture = [System.Environment]::Is64BitOperatingSystem ? "x64" : "x32"
        MachineName = $env:COMPUTERNAME
        UserName = $env:USERNAME
        IsAdmin = Test-AdminPrivileges
    }
    
    return $info
}

function Test-NodeVersion {
    [CmdletBinding()]
    [OutputType([bool])]
    param()
    
    if (-not (Test-CommandExists -Command "node")) {
        return $false
    }
    
    try {
        $nodeVersionOutput = node --version
        $nodeVersion = [version]($nodeVersionOutput -replace 'v', '')
        $minVersion = [version]"$($script:Config.MinNodeVersion).0.0"
        
        return $nodeVersion -ge $minVersion
    }
    catch {
        return $false
    }
}

function Test-NpmVersion {
    [CmdletBinding()]
    [OutputType([bool])]
    param()
    
    if (-not (Test-CommandExists -Command "npm")) {
        return $false
    }
    
    try {
        $npmVersionOutput = npm --version
        $npmVersion = [version]$npmVersionOutput
        $minVersion = [version]"$($script:Config.MinNpmVersion).0.0"
        
        return $npmVersion -ge $minVersion
    }
    catch {
        return $false
    }
}

function Install-NpmPackage {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [string]$PackageName,
        
        [string]$DisplayName,
        
        [switch]$Force
    )
    
    if (-not $DisplayName) {
        $DisplayName = $PackageName
    }
    
    $script:Stats.TotalPackages++
    
    Write-ColorOutput -Type Step -Message "Installing $DisplayName..."
    
    # Check if already installed
    if (-not $Force) {
        try {
            $installed = npm list -g $PackageName --depth=0 2>$null
            if ($installed -match $PackageName) {
                Write-ColorOutput -Type Warning -Message "$DisplayName is already installed"
                $script:Stats.SkippedInstalls++
                return $true
            }
        }
        catch {
            # Continue with installation
        }
    }
    
    if ($PSCmdlet.ShouldProcess($PackageName, "Install NPM Package")) {
        try {
            $installOutput = npm install -g $PackageName 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput -Type Success -Message "✅ Installed $DisplayName"
                $script:Stats.SuccessfulInstalls++
                return $true
            }
            else {
                Write-ColorOutput -Type Error -Message "❌ Failed to install $DisplayName"
                if ($Verbose) {
                    Write-ColorOutput -Type Error -Message "Output: $installOutput"
                }
                $script:Stats.FailedInstalls++
                return $false
            }
        }
        catch {
            Write-ColorOutput -Type Error -Message "❌ Failed to install $DisplayName - $($_.Exception.Message)"
            $script:Stats.FailedInstalls++
            return $false
        }
    }
}

function Install-ScoopPackage {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [string]$PackageName,
        
        [string]$DisplayName,
        
        [switch]$Force
    )
    
    if (-not $DisplayName) {
        $DisplayName = $PackageName
    }
    
    $script:Stats.TotalPackages++
    
    Write-ColorOutput -Type Step -Message "Installing $DisplayName via Scoop..."

    # Check if already installed
    if (-not $Force) {
        try {
            $installed = scoop list $PackageName 2>$null
            if ($installed -match $PackageName) {
                Write-ColorOutput -Type Warning -Message "$DisplayName is already installed"
                $script:Stats.SkippedInstalls++
                return $true
            }
        }
        catch {
            # Continue with installation
        }
    }
    
    if ($PSCmdlet.ShouldProcess($PackageName, "Install Scoop Package")) {
        try {
            $installOutput = scoop install $PackageName 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput -Type Success -Message "✅ Installed $DisplayName"
                $script:Stats.SuccessfulInstalls++
                return $true
            }
            else {
                Write-ColorOutput -Type Error -Message "❌ Failed to install $DisplayName"
                if ($Verbose) {
                    Write-ColorOutput -Type Error -Message "Output: $installOutput"
                }
                $script:Stats.FailedInstalls++
                return $false
            }
        }
        catch {
            Write-ColorOutput -Type Error -Message "❌ Failed to install $DisplayName - $($_.Exception.Message)"
            $script:Stats.FailedInstalls++
            return $false
        }
    }
}

function Install-ChocolateyPackage {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [string]$PackageName,
        
        [string]$DisplayName,
        
        [switch]$Force
    )
    
    if (-not $DisplayName) {
        $DisplayName = $PackageName
    }
    
    $script:Stats.TotalPackages++
    
    Write-ColorOutput -Type Step -Message "Installing $DisplayName via Chocolatey..."
    
    # Check if already installed
    if (-not $Force) {
        try {
            $installed = choco list --local-only $PackageName 2>$null
            if ($installed -match $PackageName) {
                Write-ColorOutput -Type Warning -Message "$DisplayName is already installed"
                $script:Stats.SkippedInstalls++
                return $true
            }
        }
        catch {
            # Continue with installation
        }
    }
    
    if ($PSCmdlet.ShouldProcess($PackageName, "Install Chocolatey Package")) {
        try {
            $installOutput = choco install $PackageName -y 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput -Type Success -Message "✅ Installed $DisplayName"
                $script:Stats.SuccessfulInstalls++
                return $true
            }
            else {
                Write-ColorOutput -Type Error -Message "❌ Failed to install $DisplayName"
                if ($Verbose) {
                    Write-ColorOutput -Type Error -Message "Output: $installOutput"
                }
                $script:Stats.FailedInstalls++
                return $false
            }
        }
        catch {
            Write-ColorOutput -Type Error -Message "❌ Failed to install $DisplayName - $($_.Exception.Message)"
            $script:Stats.FailedInstalls++
            return $false
        }
    }
}

# ==========================================
# Package Installation Functions
# ==========================================

function Install-EssentialNpmPackages {
    [CmdletBinding(SupportsShouldProcess)]
    param()
    
    Write-ColorOutput -Type Header -Message "Installing Essential NPM Packages"
    
    $npmPackages = @(
        @{ Name = "@antfu/ni"; DisplayName = "ni (Universal package manager)" }
        @{ Name = "rimraf"; DisplayName = "rimraf (Cross-platform rm -rf)" }
        @{ Name = "serve"; DisplayName = "serve (Static file server)" }
        @{ Name = "nodemon"; DisplayName = "nodemon (Auto-restart Node.js)" }
        @{ Name = "trash-cli"; DisplayName = "trash (Safe delete to trash)" }
        @{ Name = "fkill-cli"; DisplayName = "fkill (Interactive process killer)" }
        @{ Name = "prettier"; DisplayName = "prettier (Code formatter)" }
        @{ Name = "eslint"; DisplayName = "eslint (JavaScript linter)" }
        @{ Name = "eslint_d"; DisplayName = "eslint_d (ESLint daemon)" }
        @{ Name = "vitest"; DisplayName = "vitest (Fast unit testing)" }
        @{ Name = "esbuild"; DisplayName = "esbuild (Fast bundler)" }
        @{ Name = "turbo"; DisplayName = "turbo (Build system)" }
        @{ Name = "tldr"; DisplayName = "tldr (Simplified man pages)" }
        @{ Name = "concurrently"; DisplayName = "concurrently (Run multiple commands)" }
        @{ Name = "kill-port"; DisplayName = "kill-port (Kill process on port)" }
        @{ Name = "json-server"; DisplayName = "json-server (Mock REST API)" }
        @{ Name = "lighthouse"; DisplayName = "lighthouse (Performance auditing)" }
        @{ Name = "carbon-now-cli"; DisplayName = "carbon-now-cli (Code screenshots)" }
        @{ Name = "qrcode-terminal"; DisplayName = "qrcode-terminal (QR codes in terminal)" }
        @{ Name = "speed-test"; DisplayName = "speed-test (Internet speed test)" }
        @{ Name = "fast-cli"; DisplayName = "fast-cli (Netflix speed test)" }
    )
    
    foreach ($package in $npmPackages) {
        Install-NpmPackage -PackageName $package.Name -DisplayName $package.DisplayName -Force:$Force
    }
}

function Install-Scoop {
    [CmdletBinding(SupportsShouldProcess)]
    param()
    
    if (Test-CommandExists -Command "scoop") {
        Write-ColorOutput -Type Success -Message "Scoop is already installed"
        return $true
    }
    
    Write-ColorOutput -Type Step -Message "Installing Scoop package manager..."
    
    if ($PSCmdlet.ShouldProcess("Scoop", "Install Package Manager")) {
        try {
            # Set execution policy for current user
            Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
            
            # Install Scoop
            Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
            
            if (Test-CommandExists -Command "scoop") {
                Write-ColorOutput -Type Success -Message "✅ Scoop installed successfully"
                
                # Add useful buckets
                Write-ColorOutput -Type Step -Message "Adding useful Scoop buckets..."
                scoop bucket add extras 2>$null
                scoop bucket add main 2>$null
                
                return $true
            }
            else {
                Write-ColorOutput -Type Error -Message "❌ Scoop installation failed"
                return $false
            }
        }
        catch {
            Write-ColorOutput -Type Error -Message "❌ Failed to install Scoop: $($_.Exception.Message)"
            return $false
        }
    }
}

function Install-Chocolatey {
    [CmdletBinding(SupportsShouldProcess)]
    param()
    
    if (Test-CommandExists -Command "choco") {
        Write-ColorOutput -Type Success -Message "Chocolatey is already installed"
        return $true
    }
    
    Write-ColorOutput -Type Step -Message "Installing Chocolatey package manager..."
    
    if ($PSCmdlet.ShouldProcess("Chocolatey", "Install Package Manager")) {
        try {
            # Set execution policy for current process
            Set-ExecutionPolicy Bypass -Scope Process -Force
            
            # Install Chocolatey
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
            
            # Refresh environment variables
            $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
            
            if (Test-CommandExists -Command "choco") {
                Write-ColorOutput -Type Success -Message "✅ Chocolatey installed successfully"
                return $true
            }
            else {
                Write-ColorOutput -Type Error -Message "❌ Chocolatey installation failed"
                return $false
            }
        }
        catch {
            Write-ColorOutput -Type Error -Message "❌ Failed to install Chocolatey: $($_.Exception.Message)"
            return $false
        }
    }
}

function Install-SystemPackages {
    [CmdletBinding(SupportsShouldProcess)]
    param()
    
    if ($SkipSystemPackages) {
        Write-ColorOutput -Type Warning -Message "Skipping system packages installation"
        return
    }
    
    Write-ColorOutput -Type Header -Message "Installing System Packages"
    
    # Try to install package managers if not available
    $scoopAvailable = Test-CommandExists -Command "scoop"
    $chocoAvailable = Test-CommandExists -Command "choco"
    
    if (-not $scoopAvailable) {
        $scoopAvailable = Install-Scoop
    }
    
    if (-not $chocoAvailable -and (Test-AdminPrivileges)) {
        $chocoAvailable = Install-Chocolatey
    }
    
    if (-not $scoopAvailable -and -not $chocoAvailable) {
        Write-ColorOutput -Type Warning -Message "No package managers available. Skipping system packages."
        return
    }
    
    # Define packages to install
    $systemPackages = @(
        @{ Name = "fd"; DisplayName = "fd (Fast find alternative)"; Scoop = $true; Choco = $false }
        @{ Name = "ripgrep"; DisplayName = "ripgrep (Ultra-fast grep)"; Scoop = $true; Choco = $true }
        @{ Name = "bat"; DisplayName = "bat (Better cat with syntax highlighting)"; Scoop = $true; Choco = $true }
        @{ Name = "fzf"; DisplayName = "fzf (Fuzzy finder)"; Scoop = $true; Choco = $true }
        @{ Name = "jq"; DisplayName = "jq (JSON processor)"; Scoop = $true; Choco = $true }
        @{ Name = "yq"; DisplayName = "yq (YAML processor)"; Scoop = $true; Choco = $false }
        @{ Name = "neofetch"; DisplayName = "neofetch (System info display)"; Scoop = $true; Choco = $false }
        @{ Name = "figlet"; DisplayName = "figlet (ASCII art text)"; Scoop = $true; Choco = $false }
        @{ Name = "curl"; DisplayName = "curl (Data transfer tool)"; Scoop = $true; Choco = $true }
        @{ Name = "wget"; DisplayName = "wget (File downloader)"; Scoop = $true; Choco = $true }
        @{ Name = "git"; DisplayName = "git (Version control)"; Scoop = $true; Choco = $true }
        @{ Name = "gh"; DisplayName = "gh (GitHub CLI)"; Scoop = $true; Choco = $true }
        @{ Name = "tree"; DisplayName = "tree (Directory structure)"; Scoop = $true; Choco = $true }
    )
    
    foreach ($package in $systemPackages) {
        $installed = $false
        
        # Try Scoop first (preferred for developer tools)
        if ($scoopAvailable -and $package.Scoop) {
            $installed = Install-ScoopPackage -PackageName $package.Name -DisplayName $package.DisplayName -Force:$Force
        }
        
        # Fallback to Chocolatey if Scoop failed and package is available
        if (-not $installed -and $chocoAvailable -and $package.Choco) {
            $installed = Install-ChocolateyPackage -PackageName $package.Name -DisplayName $package.DisplayName -Force:$Force
        }
        
        if (-not $installed) {
            Write-ColorOutput -Type Warning -Message "Could not install $($package.DisplayName) - no suitable package manager"
        }
    }
}

function Install-AdditionalTools {
    [CmdletBinding(SupportsShouldProcess)]
    param()
    
    Write-ColorOutput -Type Header -Message "Installing Additional Development Tools"
    
    # Install pnpm
    if (-not (Test-CommandExists -Command "pnpm")) {
        Install-NpmPackage -PackageName "pnpm" -DisplayName "pnpm (Efficient package manager)" -Force:$Force
    }
    else {
        Write-ColorOutput -Type Warning -Message "pnpm is already installed"
        $script:Stats.SkippedInstalls++
        $script:Stats.TotalPackages++
    }
    
    # Install Bun (if available for Windows)
    if (-not (Test-CommandExists -Command "bun")) {
        Write-ColorOutput -Type Step -Message "Installing Bun (fast JavaScript runtime)..."
        
        if ($PSCmdlet.ShouldProcess("Bun", "Install JavaScript Runtime")) {
            try {
                # Use PowerShell method for Bun installation on Windows
                powershell -c "irm bun.sh/install.ps1 | iex"
                
                if (Test-CommandExists -Command "bun") {
                    Write-ColorOutput -Type Success -Message "✅ Installed Bun"
                    $script:Stats.SuccessfulInstalls++
                }
                else {
                    Write-ColorOutput -Type Warning -Message "⚠️ Bun installation may require manual PATH update"
                    $script:Stats.FailedInstalls++
                }
                $script:Stats.TotalPackages++
            }
            catch {
                Write-ColorOutput -Type Error -Message "❌ Failed to install Bun: $($_.Exception.Message)"
                $script:Stats.FailedInstalls++
                $script:Stats.TotalPackages++
            }
        }
    }
    else {
        Write-ColorOutput -Type Warning -Message "Bun is already installed"
        $script:Stats.SkippedInstalls++
        $script:Stats.TotalPackages++
    }
    
    # Install Volta (Node version manager)
    if (-not (Test-CommandExists -Command "volta")) {
        Write-ColorOutput -Type Step -Message "Installing Volta (Node version manager)..."
        
        if ($PSCmdlet.ShouldProcess("Volta", "Install Node Version Manager")) {
            try {
                # Download and install Volta for Windows
                $voltaInstaller = "$env:TEMP\volta-installer.msi"
                Invoke-WebRequest -Uri "https://github.com/volta-cli/volta/releases/latest/download/volta-1.1.1-windows-x86_64.msi" -OutFile $voltaInstaller
                
                Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $voltaInstaller, "/quiet" -Wait
                
                # Refresh environment variables
                $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
                
                if (Test-CommandExists -Command "volta") {
                    Write-ColorOutput -Type Success -Message "✅ Installed Volta"
                    $script:Stats.SuccessfulInstalls++
                }
                else {
                    Write-ColorOutput -Type Warning -Message "⚠️ Volta installation may require session restart"
                    $script:Stats.FailedInstalls++
                }
                $script:Stats.TotalPackages++
                
                # Clean up installer
                Remove-Item $voltaInstaller -ErrorAction SilentlyContinue
            }
            catch {
                Write-ColorOutput -Type Error -Message "❌ Failed to install Volta: $($_.Exception.Message)"
                $script:Stats.FailedInstalls++
                $script:Stats.TotalPackages++
            }
        }
    }
    else {
        Write-ColorOutput -Type Warning -Message "Volta is already installed"
        $script:Stats.SkippedInstalls++
        $script:Stats.TotalPackages++
    }
}

# ==========================================
# Verification Functions
# ==========================================

function Test-CriticalInstallations {
    [CmdletBinding()]
    param()
    
    Write-ColorOutput -Type Header -Message "Verifying Critical Installations"
    
    $criticalTools = @(
        @{ Command = "ni"; Description = "Universal package manager" }
        @{ Command = "serve"; Description = "Static file server" }
        @{ Command = "prettier"; Description = "Code formatter" }
        @{ Command = "nodemon"; Description = "Auto-restart for Node.js" }
    )
    
    $verified = 0
    $totalCritical = $criticalTools.Count
    
    foreach ($tool in $criticalTools) {
        if (Test-CommandExists -Command $tool.Command) {
            Write-ColorOutput -Type Success -Message "✅ $($tool.Command) is ready ($($tool.Description))"
            $verified++
        }
        else {
            Write-ColorOutput -Type Error -Message "❌ $($tool.Command) is not available"
        }
    }
    
    Write-ColorOutput -Type Step -Message "Verification complete: $verified/$totalCritical critical tools verified"
    return ($verified -eq $totalCritical)
}

function Show-InstallationSummary {
    [CmdletBinding()]
    param()
    
    $endTime = Get-Date
    $duration = $endTime - $script:Stats.StartTime
    
    Write-Host ""
    Write-ColorOutput -Type Header -Message "📊 Installation Summary"
    Write-Host ""
    
    Write-Host "Total Packages Processed:   " -NoNewline
    Write-Host $script:Stats.TotalPackages -ForegroundColor White
    
    Write-Host "Successfully Installed:     " -NoNewline
    Write-Host $script:Stats.SuccessfulInstalls -ForegroundColor Green
    
    Write-Host "Skipped (Already Exist):    " -NoNewline
    Write-Host $script:Stats.SkippedInstalls -ForegroundColor Yellow
    
    Write-Host "Failed Installations:       " -NoNewline
    Write-Host $script:Stats.FailedInstalls -ForegroundColor Red
    
    $successRate = 0
    if ($script:Stats.TotalPackages -gt 0) {
        $successRate = [math]::Round((($script:Stats.SuccessfulInstalls + $script:Stats.SkippedInstalls) / $script:Stats.TotalPackages) * 100, 1)
    }
    
    Write-Host "Success Rate:               " -NoNewline
    Write-Host "$successRate%" -ForegroundColor Cyan
    
    Write-Host "Installation Duration:      " -NoNewline
    Write-Host "$($duration.ToString('mm\:ss'))" -ForegroundColor Cyan
    
    Write-Host ""
    
    if ($script:Stats.FailedInstalls -gt 0) {
        Write-ColorOutput -Type Warning -Message "Some packages failed to install. Check the output above for details."
        Write-Host "You can manually install failed packages or run this script again with -Force parameter."
    }
}

function Show-PostInstallInformation {
    [CmdletBinding()]
    param()
    
    Write-Host ""
    Write-ColorOutput -Type Header -Message "🎉 Installation Complete!"
    Write-Host ""
    
    Write-Host "You can now use these amazing tools:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  • " -ForegroundColor Green -NoNewline
    Write-Host "ni         " -ForegroundColor White -NoNewline
    Write-Host "- Universal package manager (replaces npm/yarn/pnpm commands)"
    
    Write-Host "  • " -ForegroundColor Green -NoNewline
    Write-Host "serve      " -ForegroundColor White -NoNewline
    Write-Host "- Static file server (serve your files instantly)"
    
    Write-Host "  • " -ForegroundColor Green -NoNewline
    Write-Host "prettier   " -ForegroundColor White -NoNewline
    Write-Host "- Code formatter (keep your code beautiful)"
    
    Write-Host "  • " -ForegroundColor Green -NoNewline
    Write-Host "nodemon    " -ForegroundColor White -NoNewline
    Write-Host "- Auto-restart Node.js apps (no more manual restarts)"
    
    Write-Host "  • " -ForegroundColor Green -NoNewline
    Write-Host "fkill      " -ForegroundColor White -NoNewline
    Write-Host "- Interactive process killer (kill processes easily)"
    
    Write-Host "  • " -ForegroundColor Green -NoNewline
    Write-Host "bat        " -ForegroundColor White -NoNewline
    Write-Host "- Better cat with syntax highlighting"
    
    Write-Host "  • " -ForegroundColor Green -NoNewline
    Write-Host "fzf        " -ForegroundColor White -NoNewline
    Write-Host "- Fuzzy finder (find anything quickly)"
    
    Write-Host "  • " -ForegroundColor Green -NoNewline
    Write-Host "And many more!" -ForegroundColor White
    
    Write-Host ""
    Write-Host "💡 Quick Start Examples:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  ni                    " -ForegroundColor Yellow -NoNewline
    Write-Host "# Install dependencies (auto-detects package manager)"
    
    Write-Host "  serve .               " -ForegroundColor Yellow -NoNewline
    Write-Host "# Serve current directory"
    
    Write-Host "  prettier --write .    " -ForegroundColor Yellow -NoNewline
    Write-Host "# Format all files in current directory"
    
    Write-Host "  nodemon app.js        " -ForegroundColor Yellow -NoNewline
    Write-Host "# Run app.js with auto-restart"
    
    Write-Host "  fkill :3000           " -ForegroundColor Yellow -NoNewline
    Write-Host "# Kill process running on port 3000"
    
    Write-Host ""
    Write-Host "📚 Learn More:" -ForegroundColor Cyan
    Write-Host "  Documentation: " -NoNewline
    Write-Host $script:Config.RepoUrl -ForegroundColor Blue
    Write-Host "  Report Issues: " -NoNewline
    Write-Host "$($script:Config.RepoUrl)/issues" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Happy Coding! 🚀" -ForegroundColor Green
    Write-Host ""
    
    # Show restart recommendation if needed
    if ($script:Stats.FailedInstalls -eq 0) {
        Write-ColorOutput -Type Info -Message "Some tools may require a PowerShell session restart to work properly."
    }
}

# ==========================================
# Main Installation Function
# ==========================================

function Start-Installation {
    [CmdletBinding(SupportsShouldProcess)]
    param()
    
    # Script header
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                                ║" -ForegroundColor Cyan
    Write-Host "║  🚀 dev-cli-arsenal Windows Installer v$($script:Config.Version)           ║" -ForegroundColor Cyan
    Write-Host "║                                                                ║" -ForegroundColor Cyan
    Write-Host "║  75+ Essential CLI Tools for Windows Developers               ║" -ForegroundColor Cyan
    Write-Host "║                                                                ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # System information
    $systemInfo = Get-SystemInfo
    
    Write-ColorOutput -Type Info -Message "Detected OS: $($systemInfo.OSVersion) ($($systemInfo.Architecture))"
    Write-ColorOutput -Type Info -Message "PowerShell Version: $($systemInfo.PSVersion)"
    Write-ColorOutput -Type Info -Message "Running as Administrator: $($systemInfo.IsAdmin)"
    Write-ColorOutput -Type Info -Message "Script Version: $($script:Config.Version)"
    Write-ColorOutput -Type Info -Message "Installation started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host ""
    
    # Prerequisites check
    Write-ColorOutput -Type Header -Message "🔍 Checking Prerequisites"
    
    # Check PowerShell version
    $minPSVersion = [version]$script:Config.MinPowerShellVersion
    if ($PSVersionTable.PSVersion -lt $minPSVersion) {
        Write-ColorOutput -Type Error -Message "PowerShell $($script:Config.MinPowerShellVersion)+ is required. Current version: $($PSVersionTable.PSVersion)"
        exit 1
    }
    
    # Check Node.js
    if (-not (Test-NodeVersion)) {
        Write-ColorOutput -Type Error -Message "Node.js v$($script:Config.MinNodeVersion)+ is required but not found or outdated."
        Write-ColorOutput -Type Info -Message "Please install Node.js from: https://nodejs.org"
        exit 1
    }
    
    $nodeVersion = node --version
    Write-ColorOutput -Type Success -Message "Node.js is ready: $nodeVersion"
    
    # Check npm
    if (-not (Test-NpmVersion)) {
        Write-ColorOutput -Type Error -Message "npm v$($script:Config.MinNpmVersion)+ is required but not found or outdated."
        Write-ColorOutput -Type Info -Message "Please update npm: npm install -g npm@latest"
        exit 1
    }
    
    $npmVersion = npm --version
    Write-ColorOutput -Type Success -Message "npm is ready: v$npmVersion"
    Write-Host ""
    
    # Start installations
    try {
        Install-EssentialNpmPackages
        Write-Host ""
        
        Install-SystemPackages
        Write-Host ""
        
        Install-AdditionalTools
        Write-Host ""
        
        # Verification
        $verificationSuccess = Test-CriticalInstallations
        Write-Host ""
        
        # Show results
        Show-InstallationSummary
        Show-PostInstallInformation
        
        # Exit with appropriate code
        if ($script:Stats.FailedInstalls -eq 0) {
            exit 0
        }
        else {
            exit 1
        }
    }
    catch {
        Write-ColorOutput -Type Error -Message "Installation failed with error: $($_.Exception.Message)"
        Write-ColorOutput -Type Error -Message "Stack trace: $($_.ScriptStackTrace)"
        exit 1
    }
}

# ==========================================
# Script Entry Point
# ==========================================

# Validate PowerShell version
if ($PSVersionTable.PSVersion -lt [version]"5.1") {
    Write-Error "This script requires PowerShell 5.1 or higher. Current version: $($PSVersionTable.PSVersion)"
    exit 1
}

# Handle parameters
if ($PSBoundParameters.ContainsKey('WhatIf')) {
    Write-Host "WhatIf mode enabled - no actual installations will be performed" -ForegroundColor Yellow
}

if ($PSBoundParameters.ContainsKey('Verbose')) {
    Write-Host "Verbose mode enabled - detailed output will be shown" -ForegroundColor Yellow
}

# Start the installation
try {
    Start-Installation
}
catch {
    Write-Error "Fatal error during installation: $($_.Exception.Message)"
    exit 1
}
finally {
    # Cleanup
    if ($LogFile -and (Test-Path $LogFile)) {
        Write-Host "Installation log saved to: $LogFile" -ForegroundColor Gray
    }
}