# TablePlus Connection Decoder

A privacy-focused browser application for decrypting and exporting TablePlus connection configurations.

## Why This Exists

TablePlus can export connection configurations, but it does not provide a convenient way to export the saved passwords and connection settings in a readable, reusable format.

This application was created to solve that problem. It decrypts a TablePlus connection export and lets you view, search, and export the connection data, including database credentials and other configuration fields.

## Features

- Decrypts `.tableplusconnection` and `.tpconnection` files
- Supports TablePlus single-connection and grouped/all-connection exports
- Displays connection name, driver, host, port, username, database, group, and other fields
- Includes saved passwords and connection configuration values
- Masks sensitive values by default with an option to reveal them
- Searches across all connection fields, including hidden fields
- Sorts table columns
- Shows and hides columns
- Supports pagination
- Exports data as JSON, CSV, or XLSX
- Runs entirely in the browser
- Does not upload files or connection data to a server

## How To Use

1. Start the application.
2. Drop a TablePlus export file onto the upload area, or choose a file manually.
3. Enter the password used to create the TablePlus export.
4. Review the decrypted connections in the table.
5. Use **Columns** to show additional fields such as passwords, SSH settings, SSL settings, and groups.
6. Click the eye icon to reveal a masked sensitive value.
7. Export all connections or only the connections matching the current search.

## Supported Export Data

The application supports common TablePlus connection fields, including:

- Connection name and group
- Database driver and version
- Host, port, database, and username
- Database password
- SSH tunnel settings and credentials
- SSL/TLS settings and certificate paths
- TablePlus connection options and metadata

Grouped exports are flattened into individual connection rows. The parent group is retained as `GroupName`.

## Security and Privacy

All processing happens locally in the browser:

- The selected file is read into browser memory.
- Decryption uses the Web Crypto API.
- The export password is not sent anywhere.
- No backend or database is required.
- Sensitive fields are masked in the table by default.
- Decrypted data is cleared from application state when loading another file.

For additional protection, do not use this application on an untrusted computer and do not share exported files containing passwords.

## Encryption Support

The decryption implementation supports password-based RNCryptor v3 files:

- PBKDF2-SHA1 with 10,000 iterations
- AES-256-CBC encryption
- HMAC-SHA256 authentication

Key-based encryption and unsupported TablePlus export formats are not currently supported.

## Development

### Requirements

- Node.js 18 or newer
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Validate the project

```bash
npm run typecheck
npm run lint
npm run build
```

## Technology

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Table
- Web Crypto API
- `plist` for plist payload parsing
- SheetJS for XLSX export

## License

This project is licensed under the [MIT License](LICENSE).

## Author

**A. S. M. Muhiminul Hasan**

- Website: [muhiminulhasan.com](https://muhiminulhasan.com)
- Support the project: [Buy Me a Coffee](https://buymeacoffee.com/muhiminulhasan)
