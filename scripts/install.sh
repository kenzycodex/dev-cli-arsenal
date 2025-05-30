#!/bin/bash

# dev-cli-arsenal Universal Installer
# Version: 1.0.0
# Usage: curl -fsSL https://raw.githubusercontent.com/username/dev-cli-arsenal/main/scripts/install.sh | bash
# 
# This script installs essential CLI tools for developers across different platforms
# Supports: macOS, Linux (Ubuntu/Debian, RHEL/CentOS/Fedora), Windows (WSL)

set -euo pipefail

# ==========================================
# Configuration and Constants
# ==========================================

readonly SCRIPT_VERSION="1.0.0"
readonly SCRIPT_NAME="dev-cli-arsenal-installer"
readonly REPO_URL="https://github.com/kenzycodex/dev-cli-arsenal"
readonly MIN_NODE_VERSION="16"
readonly MIN_NPM_VERSION="8"

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m' # No Color

# Installation statistics
declare -g TOTAL_PACKAGES=0
declare -g SUCCESSFUL_INSTALLS=0
declare -g FAILED_INSTALLS=0
declare -g SKIPPED_INSTALLS=0

# ==========================================
# Utility Functions
# ==========================================

# Print colored output with timestamps
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] [INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] [SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] [WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] [ERROR]${NC} $1"
}

print_header() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] [HEADER]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[$(date +'%H:%M:%S')] [STEP]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if running with sufficient privileges for system packages
check_privileges() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. This is not recommended for npm packages."
        return 0
    fi
    
    # Check if user can sudo (for system packages)
    if sudo -n true 2>/dev/null; then
        return 0
    elif [[ "$OSTYPE" == "darwin"* ]] && command_exists brew; then
        return 0
    else
        print_warning "Limited privileges detected. Some system packages may require manual installation."
        return 1
    fi
}

# Detect operating system and distribution
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [[ -f /etc/os-release ]]; then
            # shellcheck source=/dev/null
            . /etc/os-release
            case "$ID" in
                ubuntu|debian) echo "debian" ;;
                rhel|centos|fedora|rocky|almalinux) echo "rhel" ;;
                arch|manjaro) echo "arch" ;;
                opensuse*) echo "opensuse" ;;
                *) echo "linux" ;;
            esac
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Get system architecture
get_architecture() {
    case "$(uname -m)" in
        x86_64|amd64) echo "x64" ;;
        arm64|aarch64) echo "arm64" ;;
        armv7l) echo "arm" ;;
        i386|i686) echo "x32" ;;
        *) echo "unknown" ;;
    esac
}

# Check Node.js version compatibility
check_node_version() {
    if ! command_exists node; then
        return 1
    fi
    
    local node_version
    node_version=$(node --version | sed 's/v//' | cut -d. -f1)
    
    if [[ "$node_version" -lt "$MIN_NODE_VERSION" ]]; then
        return 1
    fi
    
    return 0
}

# Check npm version compatibility
check_npm_version() {
    if ! command_exists npm; then
        return 1
    fi
    
    local npm_version
    npm_version=$(npm --version | cut -d. -f1)
    
    if [[ "$npm_version" -lt "$MIN_NPM_VERSION" ]]; then
        return 1
    fi
    
    return 0
}

# Install a single npm package with error handling
install_npm_package() {
    local package="$1"
    local display_name="${2:-$package}"
    
    ((TOTAL_PACKAGES++))
    
    print_step "Installing $display_name..."
    
    if npm list -g "$package" >/dev/null 2>&1; then
        print_warning "$display_name is already installed"
        ((SKIPPED_INSTALLS++))
        return 0
    fi
    
    if npm install -g "$package" >/dev/null 2>&1; then
        print_success "✅ Installed $display_name"
        ((SUCCESSFUL_INSTALLS++))
        return 0
    else
        print_error "❌ Failed to install $display_name"
        ((FAILED_INSTALLS++))
        return 1
    fi
}

# Install system package with platform detection
install_system_package() {
    local package="$1"
    local display_name="${2:-$package}"
    local os_type="$3"
    
    ((TOTAL_PACKAGES++))
    
    print_step "Installing $display_name..."
    
    case "$os_type" in
        "macos")
            if command_exists "$package" || brew list "$package" >/dev/null 2>&1; then
                print_warning "$display_name is already installed"
                ((SKIPPED_INSTALLS++))
                return 0
            fi
            
            if brew install "$package" >/dev/null 2>&1; then
                print_success "✅ Installed $display_name"
                ((SUCCESSFUL_INSTALLS++))
            else
                print_error "❌ Failed to install $display_name"
                ((FAILED_INSTALLS++))
            fi
            ;;
        "debian")
            if command_exists "$package" || dpkg -l "$package" >/dev/null 2>&1; then
                print_warning "$display_name is already installed"
                ((SKIPPED_INSTALLS++))
                return 0
            fi
            
            if sudo apt-get install -y "$package" >/dev/null 2>&1; then
                print_success "✅ Installed $display_name"
                ((SUCCESSFUL_INSTALLS++))
            else
                print_error "❌ Failed to install $display_name"
                ((FAILED_INSTALLS++))
            fi
            ;;
        "rhel")
            if command_exists "$package" || rpm -q "$package" >/dev/null 2>&1; then
                print_warning "$display_name is already installed"
                ((SKIPPED_INSTALLS++))
                return 0
            fi
            
            if command_exists dnf; then
                if sudo dnf install -y "$package" >/dev/null 2>&1; then
                    print_success "✅ Installed $display_name"
                    ((SUCCESSFUL_INSTALLS++))
                else
                    print_error "❌ Failed to install $display_name"
                    ((FAILED_INSTALLS++))
                fi
            elif command_exists yum; then
                if sudo yum install -y "$package" >/dev/null 2>&1; then
                    print_success "✅ Installed $display_name"
                    ((SUCCESSFUL_INSTALLS++))
                else
                    print_error "❌ Failed to install $display_name"
                    ((FAILED_INSTALLS++))
                fi
            fi
            ;;
        "arch")
            if command_exists "$package" || pacman -Q "$package" >/dev/null 2>&1; then
                print_warning "$display_name is already installed"
                ((SKIPPED_INSTALLS++))
                return 0
            fi
            
            if sudo pacman -S --noconfirm "$package" >/dev/null 2>&1; then
                print_success "✅ Installed $display_name"
                ((SUCCESSFUL_INSTALLS++))
            else
                print_error "❌ Failed to install $display_name"
                ((FAILED_INSTALLS++))
            fi
            ;;
    esac
}

# ==========================================
# Package Installation Functions
# ==========================================

# Install essential npm packages
install_npm_packages() {
    print_header "Installing Essential NPM Packages"
    
    local npm_packages=(
        "@antfu/ni:ni (Universal package manager)"
        "rimraf:rimraf (Cross-platform rm -rf)"
        "serve:serve (Static file server)"
        "nodemon:nodemon (Auto-restart Node.js)"
        "trash-cli:trash (Safe delete to trash)"
        "fkill-cli:fkill (Interactive process killer)"
        "prettier:prettier (Code formatter)"
        "eslint:eslint (JavaScript linter)"
        "eslint_d:eslint_d (ESLint daemon)"
        "vitest:vitest (Fast unit testing)"
        "esbuild:esbuild (Fast bundler)"
        "turbo:turbo (Build system)"
        "tldr:tldr (Simplified man pages)"
        "concurrently:concurrently (Run multiple commands)"
        "kill-port:kill-port (Kill process on port)"
        "json-server:json-server (Mock REST API)"
        "lighthouse:lighthouse (Performance auditing)"
        "carbon-now-cli:carbon-now-cli (Code screenshots)"
        "qrcode-terminal:qrcode-terminal (QR codes in terminal)"
        "speed-test:speed-test (Internet speed test)"
        "fast-cli:fast-cli (Netflix speed test)"
    )
    
    for package_info in "${npm_packages[@]}"; do
        local package="${package_info%:*}"
        local display_name="${package_info#*:}"
        install_npm_package "$package" "$display_name"
    done
}

# Install system packages based on OS
install_system_packages() {
    local os_type="$1"
    
    print_header "Installing System Packages for $(echo "$os_type" | tr '[:lower:]' '[:upper:]')"
    
    case "$os_type" in
        "macos")
            if ! command_exists brew; then
                print_error "Homebrew not found. Installing Homebrew first..."
                if /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"; then
                    print_success "Homebrew installed successfully"
                else
                    print_error "Failed to install Homebrew. Some packages may not be available."
                    return 1
                fi
            fi
            
            # Update Homebrew
            print_step "Updating Homebrew..."
            brew update >/dev/null 2>&1 || print_warning "Failed to update Homebrew"
            
            local macos_packages=(
                "fd:fd (Fast find alternative)"
                "ripgrep:ripgrep (Ultra-fast grep)"
                "bat:bat (Better cat with syntax highlighting)"
                "fzf:fzf (Fuzzy finder)"
                "tree:tree (Directory structure visualization)"
                "htop:htop (Interactive process viewer)"
                "jq:jq (JSON processor)"
                "yq:yq (YAML processor)"
                "neofetch:neofetch (System info display)"
                "figlet:figlet (ASCII art text)"
                "git-delta:git-delta (Better git diffs)"
                "gh:gh (GitHub CLI)"
                "httpie:httpie (HTTP client)"
                "wget:wget (File downloader)"
                "curl:curl (Data transfer tool)"
            )
            
            for package_info in "${macos_packages[@]}"; do
                local package="${package_info%:*}"
                local display_name="${package_info#*:}"
                install_system_package "$package" "$display_name" "$os_type"
            done
            ;;
            
        "debian")
            print_step "Updating package list..."
            sudo apt-get update >/dev/null 2>&1 || print_warning "Failed to update package list"
            
            local debian_packages=(
                "fd-find:fd (Fast find alternative)"
                "ripgrep:ripgrep (Ultra-fast grep)"
                "bat:bat (Better cat with syntax highlighting)"
                "fzf:fzf (Fuzzy finder)"
                "tree:tree (Directory structure visualization)"
                "htop:htop (Interactive process viewer)"
                "jq:jq (JSON processor)"
                "neofetch:neofetch (System info display)"
                "figlet:figlet (ASCII art text)"
                "curl:curl (Data transfer tool)"
                "wget:wget (File downloader)"
                "git:git (Version control)"
            )
            
            for package_info in "${debian_packages[@]}"; do
                local package="${package_info%:*}"
                local display_name="${package_info#*:}"
                install_system_package "$package" "$display_name" "$os_type"
            done
            ;;
            
        "rhel")
            print_step "Installing EPEL repository..."
            sudo dnf install -y epel-release >/dev/null 2>&1 || sudo yum install -y epel-release >/dev/null 2>&1 || print_warning "Failed to install EPEL"
            
            local rhel_packages=(
                "fd-find:fd (Fast find alternative)"
                "ripgrep:ripgrep (Ultra-fast grep)"
                "bat:bat (Better cat with syntax highlighting)"
                "fzf:fzf (Fuzzy finder)"
                "tree:tree (Directory structure visualization)"
                "htop:htop (Interactive process viewer)"
                "jq:jq (JSON processor)"
                "neofetch:neofetch (System info display)"
                "figlet:figlet (ASCII art text)"
                "curl:curl (Data transfer tool)"
                "wget:wget (File downloader)"
                "git:git (Version control)"
            )
            
            for package_info in "${rhel_packages[@]}"; do
                local package="${package_info%:*}"
                local display_name="${package_info#*:}"
                install_system_package "$package" "$display_name" "$os_type"
            done
            ;;
            
        "arch")
            print_step "Updating package database..."
            sudo pacman -Sy >/dev/null 2>&1 || print_warning "Failed to update package database"
            
            local arch_packages=(
                "fd:fd (Fast find alternative)"
                "ripgrep:ripgrep (Ultra-fast grep)"
                "bat:bat (Better cat with syntax highlighting)"
                "fzf:fzf (Fuzzy finder)"
                "tree:tree (Directory structure visualization)"
                "htop:htop (Interactive process viewer)"
                "jq:jq (JSON processor)"
                "neofetch:neofetch (System info display)"
                "figlet:figlet (ASCII art text)"
                "curl:curl (Data transfer tool)"
                "wget:wget (File downloader)"
                "git:git (Version control)"
            )
            
            for package_info in "${arch_packages[@]}"; do
                local package="${package_info%:*}"
                local display_name="${package_info#*:}"
                install_system_package "$package" "$display_name" "$os_type"
            done
            ;;
    esac
}

# Install additional development tools
install_additional_tools() {
    print_header "Installing Additional Development Tools"
    
    # Install Bun if not exists
    if ! command_exists bun; then
        print_step "Installing Bun (fast JavaScript runtime)..."
        if curl -fsSL https://bun.sh/install | bash >/dev/null 2>&1; then
            print_success "✅ Installed Bun"
            ((SUCCESSFUL_INSTALLS++))
        else
            print_error "❌ Failed to install Bun"
            ((FAILED_INSTALLS++))
        fi
        ((TOTAL_PACKAGES++))
    else
        print_warning "Bun is already installed"
        ((SKIPPED_INSTALLS++))
        ((TOTAL_PACKAGES++))
    fi
    
    # Install pnpm if not exists
    if ! command_exists pnpm; then
        install_npm_package "pnpm" "pnpm (Efficient package manager)"
    else
        print_warning "pnpm is already installed"
        ((SKIPPED_INSTALLS++))
        ((TOTAL_PACKAGES++))
    fi
    
    # Install Volta (Node version manager) if not exists
    if ! command_exists volta; then
        print_step "Installing Volta (Node version manager)..."
        if curl https://get.volta.sh | bash >/dev/null 2>&1; then
            print_success "✅ Installed Volta"
            ((SUCCESSFUL_INSTALLS++))
        else
            print_error "❌ Failed to install Volta"
            ((FAILED_INSTALLS++))
        fi
        ((TOTAL_PACKAGES++))
    else
        print_warning "Volta is already installed"
        ((SKIPPED_INSTALLS++))
        ((TOTAL_PACKAGES++))
    fi
}

# ==========================================
# Verification Functions
# ==========================================

# Verify critical installations
verify_installations() {
    print_header "Verifying Critical Installations"
    
    local critical_tools=(
        "ni:Universal package manager"
        "serve:Static file server"
        "prettier:Code formatter"
        "nodemon:Auto-restart for Node.js"
    )
    
    local verified=0
    local total_critical=${#critical_tools[@]}
    
    for tool_info in "${critical_tools[@]}"; do
        local tool="${tool_info%:*}"
        local description="${tool_info#*:}"
        
        if command_exists "$tool"; then
            print_success "✅ $tool is ready ($description)"
            ((verified++))
        else
            print_error "❌ $tool is not available"
        fi
    done
    
    print_step "Verification complete: $verified/$total_critical critical tools verified"
}

# ==========================================
# Main Installation Function
# ==========================================

# Display installation summary
show_summary() {
    echo ""
    print_header "📊 Installation Summary"
    echo ""
    echo -e "${WHITE}Total Packages Processed:${NC} $TOTAL_PACKAGES"
    echo -e "${GREEN}Successfully Installed:${NC}   $SUCCESSFUL_INSTALLS"
    echo -e "${YELLOW}Skipped (Already Exist):${NC}  $SKIPPED_INSTALLS"
    echo -e "${RED}Failed Installations:${NC}     $FAILED_INSTALLS"
    
    local success_rate=0
    if [[ $TOTAL_PACKAGES -gt 0 ]]; then
        success_rate=$(( (SUCCESSFUL_INSTALLS + SKIPPED_INSTALLS) * 100 / TOTAL_PACKAGES ))
    fi
    
    echo -e "${CYAN}Success Rate:${NC}             ${success_rate}%"
    echo ""
    
    if [[ $FAILED_INSTALLS -gt 0 ]]; then
        print_warning "Some packages failed to install. Check the output above for details."
        echo "You can manually install failed packages or run this script again."
    fi
}

# Display post-installation information
show_post_install_info() {
    echo ""
    print_header "🎉 Installation Complete!"
    echo ""
    echo -e "${CYAN}You can now use these amazing tools:${NC}"
    echo ""
    echo -e "  ${GREEN}•${NC} ${WHITE}ni${NC}         - Universal package manager (replaces npm/yarn/pnpm commands)"
    echo -e "  ${GREEN}•${NC} ${WHITE}serve${NC}      - Static file server (serve your files instantly)"
    echo -e "  ${GREEN}•${NC} ${WHITE}prettier${NC}   - Code formatter (keep your code beautiful)"
    echo -e "  ${GREEN}•${NC} ${WHITE}nodemon${NC}    - Auto-restart Node.js apps (no more manual restarts)"
    echo -e "  ${GREEN}•${NC} ${WHITE}fkill${NC}      - Interactive process killer (kill processes easily)"
    echo -e "  ${GREEN}•${NC} ${WHITE}bat${NC}        - Better cat with syntax highlighting"
    echo -e "  ${GREEN}•${NC} ${WHITE}fzf${NC}        - Fuzzy finder (find anything quickly)"
    echo -e "  ${GREEN}•${NC} ${WHITE}And many more!${NC}"
    echo ""
    echo -e "${CYAN}💡 Quick Start Examples:${NC}"
    echo ""
    echo -e "  ${YELLOW}ni${NC}                    # Install dependencies (auto-detects package manager)"
    echo -e "  ${YELLOW}serve .${NC}               # Serve current directory"
    echo -e "  ${YELLOW}prettier --write .${NC}    # Format all files in current directory"
    echo -e "  ${YELLOW}nodemon app.js${NC}        # Run app.js with auto-restart"
    echo -e "  ${YELLOW}fkill :3000${NC}           # Kill process running on port 3000"
    echo ""
    echo -e "${CYAN}📚 Learn More:${NC}"
    echo -e "  Documentation: ${BLUE}$REPO_URL${NC}"
    echo -e "  Report Issues: ${BLUE}$REPO_URL/issues${NC}"
    echo ""
    echo -e "${GREEN}Happy Coding! 🚀${NC}"
    echo ""
}

# Main installation function
main() {
    # Script header
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}                                                                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${WHITE}🚀 dev-cli-arsenal Universal Installer v$SCRIPT_VERSION${NC}           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${YELLOW}75+ Essential CLI Tools for Developers${NC}                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                                ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # System information
    local os_type
    local architecture
    os_type=$(detect_os)
    architecture=$(get_architecture)
    
    print_status "Detected OS: $os_type ($architecture)"
    print_status "Script Version: $SCRIPT_VERSION"
    print_status "Installation started at: $(date)"
    echo ""
    
    # Check privileges
    check_privileges
    echo ""
    
    # Prerequisites check
    print_header "🔍 Checking Prerequisites"
    
    if ! check_node_version; then
        print_error "Node.js v$MIN_NODE_VERSION+ is required but not found or outdated."
        print_status "Please install Node.js from: https://nodejs.org"
        exit 1
    fi
    
    local node_version
    node_version=$(node --version)
    print_success "Node.js is ready: $node_version"
    
    if ! check_npm_version; then
        print_error "npm v$MIN_NPM_VERSION+ is required but not found or outdated."
        print_status "Please update npm: npm install -g npm@latest"
        exit 1
    fi
    
    local npm_version
    npm_version=$(npm --version)
    print_success "npm is ready: v$npm_version"
    echo ""
    
    # Start installations
    install_npm_packages
    echo ""
    
    if [[ "$os_type" != "unknown" ]] && [[ "$os_type" != "windows" ]]; then
        install_system_packages "$os_type"
        echo ""
    else
        print_warning "System package installation not supported for: $os_type"
        echo ""
    fi
    
    install_additional_tools
    echo ""
    
    # Verification
    verify_installations
    echo ""
    
    # Show results
    show_summary
    show_post_install_info
    
    # Final status
    if [[ $FAILED_INSTALLS -eq 0 ]]; then
        exit 0
    else
        exit 1
    fi
}

# ==========================================
# Script Execution
# ==========================================

# Trap for cleanup
trap 'print_error "Installation interrupted! Please run the script again."' INT TERM

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version|-v)
            echo "dev-cli-arsenal installer version $SCRIPT_VERSION"
            exit 0
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --version, -v    Show version information"
            echo "  --help, -h       Show this help message"
            echo ""
            echo "For more information, visit: $REPO_URL"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information."
            exit 1
            ;;
    esac
    shift
done

# Run main function
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi