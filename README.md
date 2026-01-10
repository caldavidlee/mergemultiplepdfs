# PDF Merger

A privacy-first PDF merger that runs entirely in your browser. No uploads, no servers — your files never leave your device.

## Features

- **100% Client-Side** — All PDF processing happens locally in your browser
- **Privacy First** — Your files are never uploaded to any server
- **Drag & Drop** — Easy file selection and reordering
- **Page Selection** — Choose specific pages from each PDF to include
- **Instant Merge** — Combine multiple PDFs into one with a single click

## Tech Stack

- [React](https://react.dev/) — UI framework
- [pdf-lib](https://pdf-lib.js.org/) — PDF manipulation
- [PDF.js](https://mozilla.github.io/pdf.js/) — PDF rendering for thumbnails
- [@dnd-kit](https://dndkit.com/) — Drag and drop functionality
- [Vite](https://vitejs.dev/) — Build tool

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/caldavidlee/mergemultiplepdfs.git
cd mergemultiplepdfs

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## How It Works

1. **Drop your PDFs** — Drag files into the drop zone or click to browse
2. **Select pages** — Click thumbnails to toggle individual pages on/off
3. **Reorder documents** — Drag to rearrange the order of your PDFs
4. **Merge** — Click the merge button to combine and download

All processing uses the [pdf-lib](https://pdf-lib.js.org/) library directly in your browser. No data is ever transmitted to external servers.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Author

Created by [@caldavidlee](https://github.com/caldavidlee)


