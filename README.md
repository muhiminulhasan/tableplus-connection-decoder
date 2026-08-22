# TablePlus Connection Decoder

[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-2ea44f?style=for-the-badge&logo=googlechrome&logoColor=white)](https://tableplus-t0ug3.sevalla.page/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/muhiminulhasan)

[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Privacy](https://img.shields.io/badge/100%25_Client--Side-No_Tracking-8b5cf6?style=flat-square&logo=protonmail&logoColor=white)](#security-and-privacy)

**Try it live: [tableplus-t0ug3.sevalla.page](https://tableplus-t0ug3.sevalla.page/)**

A privacy-focused browser application for decrypting and exporting TablePlus connection configurations.

> **Disclaimer:** This is an independent, open-source utility. It is not affiliated with, funded by, or associated with TablePlus or its parent company. "TablePlus" is used descriptively to indicate file-format compatibility only. All trademarks belong to their respective owners.

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

The decryption implementation supports password-based RNCryptor v3 files, an [open, publicly documented format specification](https://github.com/RNCryptor/RNCryptor-Spec):

- PBKDF2-SHA1 with 10,000 iterations
- AES-256-CBC encryption
- HMAC-SHA256 authentication

This project was implemented from the public RNCryptor format specification using the browser's Web Crypto API. No TablePlus application code was decompiled, disassembled, or reused.

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
