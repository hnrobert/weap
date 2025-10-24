# WEAP - Secure Multi-Tab Browser

WEAP is a secure Electron-based browser that restricts access to a predefined whitelist of websites. It features a modern multi-tab interface with basic navigation controls.

## Features

- 🔒 **Website Whitelisting**: Only allows access to predefined websites
- 📑 **Multi-Tab Support**: Open multiple websites in separate tabs
- 🔄 **Navigation Controls**: Back, forward, and reload functionality
- 🎨 **Modern UI**: Clean, intuitive interface with dark mode support
- 🏗️ **Build-time Configuration**: Configure allowed websites during build
- 🚀 **Cross-platform**: Supports macOS, Windows, and Linux

## Screenshots

[Add screenshots here]

## Configuration

The allowed websites are configured at build time through environment variables:

- `ALLOWED_WEBSITES`: Comma-separated list of allowed websites (e.g., "https://google.com,https://github.com")
- `APP_NAME`: Custom application name (optional)

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd weap

# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Run in development mode
pnpm run dev
```

### Building

```bash
# Build for current platform
pnpm run dist

# Build for specific platforms
pnpm run dist:mac    # macOS
pnpm run dist:win    # Windows
pnpm run dist:linux  # Linux
```

### Environment Variables

Set these environment variables before building:

```bash
export ALLOWED_WEBSITES="https://google.com,https://github.com,https://stackoverflow.com"
export APP_NAME="My Custom Browser"
```

## GitHub Actions Build

The project includes automated builds through GitHub Actions. You can trigger a build by:

1. Going to the "Actions" tab in your GitHub repository
2. Selecting "Build and Release Electron App"
3. Clicking "Run workflow"
4. Entering:
   - **Allowed websites**: Comma-separated list (e.g., `https://google.com,https://github.com`)
   - **App name**: Custom name for your app (optional)
   - **Release tag**: Version tag for creating a release (optional)

The workflow will build the app for all supported platforms and architectures:

### Supported Platforms & Architectures

**macOS:**

- Intel (x64)
- Apple Silicon (arm64)
- Formats: DMG, ZIP

**Windows:**

- x64
- x86 (32-bit)
- ARM64
- Formats: NSIS installer, Portable executable

**Linux:**

- x64
- ARM64
- Formats: AppImage, DEB, RPM

## Usage

1. Launch the application
2. Use the dropdown menu to select from allowed websites
3. Click "Go" or press Enter to navigate
4. Use the + button or Cmd/Ctrl+T to open new tabs
5. Use navigation buttons or keyboard shortcuts for back/forward/reload

### Keyboard Shortcuts

- `Cmd/Ctrl + T`: New tab
- `Cmd/Ctrl + W`: Close tab
- `Cmd/Ctrl + R`: Reload
- `Cmd/Ctrl + Q`: Quit application
- `Cmd/Ctrl + ←`: Go back
- `Cmd/Ctrl + →`: Go forward

## Security

WEAP implements several security measures:

- **Request filtering**: All network requests are filtered against the whitelist
- **Context isolation**: Renderer processes are isolated from the main process
- **No remote module**: Remote module access is disabled
- **Content Security Policy**: Strict CSP is enforced
- **External link blocking**: External links are blocked or opened in the system browser

## Architecture

```tree
├── src/
│   ├── main.ts          # Main Electron process
│   └── preload.ts       # Preload script for secure IPC
├── assets/
│   ├── index.html       # Main UI
│   ├── styles.css       # Styling
│   └── renderer.js      # Renderer process logic
├── .github/workflows/
│   └── build.yml        # GitHub Actions workflow
└── package.json         # Dependencies and build config
```

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Build Issues

- Ensure you have the correct Node.js version (18+)
- Clear cache: `pnpm store prune`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`

### Runtime Issues

- Check the developer console for errors (View → Toggle Developer Tools)
- Verify that the websites in your whitelist are accessible
- Ensure proper URL format (include `https://` or `http://`)

## Changelog

### v1.0.0

- Initial release
- Multi-tab browsing
- Website whitelisting
- Cross-platform builds
- GitHub Actions integration
