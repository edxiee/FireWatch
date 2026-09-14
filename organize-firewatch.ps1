$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================"
Write-Host " FireWatch Folder Structure Organizer"
Write-Host "========================================"
Write-Host ""

# Make sure the script runs from the FireWatch root
Set-Location $PSScriptRoot

if (-not (Test-Path ".\src")) {
    throw "ERROR: src folder was not found. Run this script from the FireWatch project root."
}

# --------------------------------------------------
# 1. CREATE NEW DIRECTORIES
# --------------------------------------------------

$folders = @(
    "src\app",

    "src\components\navigation",
    "src\components\routing",

    "src\features\admin\dashboard",
    "src\features\admin\users",

    "src\features\auth",
    "src\features\emergencies",
    "src\features\home",
    "src\features\messages",
    "src\features\notifications",
    "src\features\profile",

    "src\pages\landing",

    "src\services",
    "src\styles"
)

Write-Host "Creating folders..." -ForegroundColor Cyan

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "Created: $folder"
    }
    else {
        Write-Host "Already exists: $folder"
    }
}

# --------------------------------------------------
# 2. SAFE FILE MOVE FUNCTION
# --------------------------------------------------

function Move-FireWatchFile {
    param (
        [string]$Source,
        [string]$Destination
    )

    if (-not (Test-Path $Source)) {
        Write-Warning "Source not found: $Source"
        return
    }

    if (Test-Path $Destination) {
        throw "Destination already exists: $Destination"
    }

    $destinationFolder = Split-Path $Destination -Parent

    if (-not (Test-Path $destinationFolder)) {
        New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null
    }

    Move-Item -Path $Source -Destination $Destination

    Write-Host "Moved: $Source"
    Write-Host "    -> $Destination" -ForegroundColor Green
}

# --------------------------------------------------
# 3. FILE MAPPING
# --------------------------------------------------

$moves = [ordered]@{

    # APP
    "src\App.jsx" =
        "src\app\App.jsx"

    "src\App.css" =
        "src\app\App.css"

    "src\ErrorBoundary.jsx" =
        "src\app\ErrorBoundary.jsx"


    # FIREBASE
    "src\firebase.js" =
        "src\services\firebase.js"


    # GLOBAL STYLES
    "src\index.css" =
        "src\styles\index.css"


    # LANDING PAGE
    "src\LandingPage.jsx" =
        "src\pages\landing\LandingPage.jsx"


    # ROUTING
    "src\components\ProtectedRoute.jsx" =
        "src\components\routing\ProtectedRoute.jsx"


    # AUTH
    "src\auth\Auth.jsx" =
        "src\features\auth\Auth.jsx"

    "src\auth\Auth.css" =
        "src\features\auth\Auth.css"


    # USER HOME
    "src\pages\HomeScreen.jsx" =
        "src\features\home\HomeScreen.jsx"

    "src\pages\HomeScreen.css" =
        "src\features\home\HomeScreen.css"


    # EMERGENCY
    "src\pages\EmergencyScreen.jsx" =
        "src\features\emergencies\EmergencyScreen.jsx"

    "src\pages\EmergencyScreen.css" =
        "src\features\emergencies\EmergencyScreen.css"


    # USER MESSAGES
    "src\pages\Message.jsx" =
        "src\features\messages\Message.jsx"

    "src\pages\Message.css" =
        "src\features\messages\Message.css"


    # ADMIN MESSAGES
    "src\admin\AdminMessages.jsx" =
        "src\features\messages\AdminMessages.jsx"

    "src\admin\AdminMessages.css" =
        "src\features\messages\AdminMessages.css"


    # USER NOTIFICATIONS
    "src\pages\Notification.jsx" =
        "src\features\notifications\Notification.jsx"

    "src\pages\Notification.css" =
        "src\features\notifications\Notification.css"


    # ADMIN NOTIFICATIONS
    "src\admin\AdminNotifications.jsx" =
        "src\features\notifications\AdminNotifications.jsx"

    "src\admin\AdminNotifications.css" =
        "src\features\notifications\AdminNotifications.css"


    # USER PROFILE
    "src\pages\PersonalDetails.jsx" =
        "src\features\profile\PersonalDetails.jsx"

    "src\pages\PersonalDetails.css" =
        "src\features\profile\PersonalDetails.css"

    "src\pages\UserEditProfile.jsx" =
        "src\features\profile\UserEditProfile.jsx"

    "src\pages\UserEditProfile.css" =
        "src\features\profile\UserEditProfile.css"


    # ADMIN PROFILE
    "src\admin\AdminProfile.jsx" =
        "src\features\profile\AdminProfile.jsx"

    "src\admin\AdminProfile.css" =
        "src\features\profile\AdminProfile.css"

    "src\admin\EditProfile.jsx" =
        "src\features\profile\EditProfile.jsx"

    "src\admin\EditProfile.css" =
        "src\features\profile\EditProfile.css"


    # ADMIN DASHBOARD
    "src\admin\AdminScreen.jsx" =
        "src\features\admin\dashboard\AdminScreen.jsx"

    "src\admin\AdminScreen.css" =
        "src\features\admin\dashboard\AdminScreen.css"


    # ADMIN USERS
    "src\admin\UserList.jsx" =
        "src\features\admin\users\UserList.jsx"

    "src\admin\UserList.css" =
        "src\features\admin\users\UserList.css"

    "src\admin\CreateAdmin.jsx" =
        "src\features\admin\users\CreateAdmin.jsx"

    "src\admin\CreateAdmin.css" =
        "src\features\admin\users\CreateAdmin.css"


    # ADMIN NAVIGATION
    "src\admin\AdminNavBar.jsx" =
        "src\components\navigation\AdminNavBar.jsx"

    "src\admin\AdminNavBar.css" =
        "src\components\navigation\AdminNavBar.css"


    # USER NAVIGATION
    "src\pages\UserNavBar.jsx" =
        "src\components\navigation\UserNavBar.jsx"

    "src\pages\UserNavBar.css" =
        "src\components\navigation\UserNavBar.css"
}

# --------------------------------------------------
# 4. MOVE FILES
# --------------------------------------------------

Write-Host ""
Write-Host "Moving FireWatch files..." -ForegroundColor Cyan
Write-Host ""

foreach ($item in $moves.GetEnumerator()) {
    Move-FireWatchFile `
        -Source $item.Key `
        -Destination $item.Value
}

# --------------------------------------------------
# 5. REMOVE OLD EMPTY DIRECTORIES
# --------------------------------------------------

$oldFolders = @(
    "src\admin",
    "src\auth"
)

foreach ($folder in $oldFolders) {

    if (Test-Path $folder) {

        $contents = Get-ChildItem $folder -Force

        if ($contents.Count -eq 0) {
            Remove-Item $folder
            Write-Host "Removed empty folder: $folder"
        }
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host " FireWatch files successfully organized"
Write-Host "========================================"
Write-Host ""
Write-Host "IMPORTANT:"
Write-Host "Import paths may now need to be updated."
Write-Host ""
Write-Host "Run:"
Write-Host "    npm run build"
Write-Host ""
Write-Host "Then fix any unresolved imports."
Write-Host ""