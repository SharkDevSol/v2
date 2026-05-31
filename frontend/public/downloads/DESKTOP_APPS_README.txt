Desktop Application Files
========================

Place your desktop installer files here:

1. skoolific-admin-windows.exe  (Windows Installer)
2. skoolific-admin-mac.dmg      (macOS Disk Image)
3. skoolific-admin-linux.AppImage (Linux Portable App)

How to Generate These Files:
-----------------------------

Follow the BUILD_DESKTOP_APPS.md guide in the root folder.

Quick Options:

Option 1: PWA Builder (Easiest - No Coding)
- Go to https://www.pwabuilder.com/
- Enter your website URL
- Click "Build My PWA"
- Download Windows/Mac/Linux packages
- Rename and place here

Option 2: Electron (Professional)
- Follow BUILD_DESKTOP_APPS.md guide
- Build using electron-builder
- Copy generated files here

Option 3: Use PWA Only (Recommended for Now)
- No desktop installers needed
- Users can install PWA from browser
- Works on all platforms
- Easier to maintain

File Sizes:
-----------
- Windows .exe: ~80-100 MB (Electron) or ~5-10 MB (PWA Builder)
- macOS .dmg: ~100-120 MB (Electron) or ~8-12 MB (PWA Builder)
- Linux .AppImage: ~85-95 MB (Electron) or ~6-10 MB (PWA Builder)

Note: Until you generate these files, the download buttons will show
"File not available" error. This is expected.

For most users, the PWA install option (Install on Mobile/Browser button)
is sufficient and doesn't require these files.
