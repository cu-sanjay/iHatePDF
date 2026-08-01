<div align="center">

# 🧨 iHatePDF

### Every PDF tool you need — 100% in your browser. Zero uploads. Zero accounts.

[![Live Demo](https://img.shields.io/badge/Live_Demo-i--hate--pdf-E63228?style=for-the-badge&logo=vercel&logoColor=white)](https://i-hate-pdf.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0A0A0A?style=for-the-badge)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](#-contributing)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![KaTeX](https://img.shields.io/badge/KaTeX-math-329932?style=flat-square)](https://katex.org)
[![pdf-lib](https://img.shields.io/badge/pdf--lib-PDF_engine-FF4438?style=flat-square)](https://pdf-lib.js.org)
[![PDF.js](https://img.shields.io/badge/PDF.js-rendering-D93025?style=flat-square&logo=mozilla&logoColor=white)](https://mozilla.github.io/pdf.js/)

<img src="https://github.com/user-attachments/assets/cb97aab7-6c03-41da-81ee-2cc93bef2a2b" alt="iHatePDF banner" width="100%" />

</div>

## 📌 Table of Contents

- [What's New](#-whats-new)
- [Why iHatePDF](#-why-ihatepdf)
- [Tools](#-tools)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ What's New

> [!NOTE]
> **v3.0**

<table>
<tr>
<td width="50%">

**🪄 Drag & Drop Hero**
Drop files once on the home page and they follow you everywhere. No re-uploading between tools.

</td>
<td width="50%">

**🗂️ File Vault**
A shared in-memory vault carries your PDFs and images across every tool page automatically.

</td>
</tr>
<tr>
<td>

**🖼️ Real PDF Previews**
Page thumbnails render everywhere, with a graceful PDF-icon fallback if a file can't be parsed.

</td>
<td>

**🧮 Equation → Image**
Type LaTeX, get a pixel-tight cropped PNG for papers, reports and slides. Fraction rules now align perfectly.

</td>
</tr>
<tr>
<td>

**✍️ Sign PDF**
Draw a signature on a signpad, then place, drag and resize it anywhere on the page.

</td>
<td>

**📉 Smarter Compression**
Live preview per quality level, predicted output size, and target-size mode for PDFs and images.

</td>
</tr>
</table>

> [!IMPORTANT]
> Your files **never leave your device**. All parsing, rendering and export happens in the browser, there is no upload endpoint at all.

## 🚀 Why iHatePDF

| | |
|---|---|
| 🔒 **Private by design** | Files are processed locally; nothing is uploaded, logged or stored. |
| 🆓 **Free forever** | No paywalls, no premium tier, no watermarks on your output. |
| 👤 **No account** | Open the site and start working. That's it. |
| ⚡ **Instant** | No queues, no round-trips — conversion speed is your CPU's speed. |
| 📱 **Works anywhere** | Responsive, touch-friendly layouts from phones to ultrawide screens. |

## 🧰 Tools

### 📄 PDF

| Tool | Route | What it does |
|---|---|---|
| **Merge PDFs** | `/merge-pdfs` | Combine multiple PDFs, reorder pages before export |
| **Split PDF** | `/split-pdf` | Extract page ranges or burst into separate files |
| **Compress PDF** | `/compress-pdf` | Quality presets with live preview + target file size |
| **PDF → Image** | `/pdf-to-image` | Export pages as JPG, PNG or WebP at chosen DPI |
| **Image → PDF** | `/image-to-pdf` | Merge images into one document with page sizing |
| **Watermark PDF** | `/watermark-pdf` | Text watermarks with opacity, rotation and position |
| **Lock PDF** | `/lock-pdf` | Password-protect a document |
| **Sign PDF** | `/sign-pdf` | Draw a signature and place / resize it on any page |

### 🖼️ Image

| Tool | Route | What it does |
|---|---|---|
| **Compress Image** | `/compress-image` | Quality slider, live preview, predicted size |

### 🧮 Documents & Math

| Tool | Route | What it does |
|---|---|---|
| **Equation → Image** | `/equation-to-image` | LaTeX math rendered to a cropped, transparent PNG |
| **LaTeX Resume** | `/latex-resume` | Write LaTeX-style resumes and export to PDF |
| **Resume Builder** | `/resume-builder` | Form-driven resume templates, no LaTeX needed |

## 📸 Screenshots

<div align="center">

| Home — Drag & Drop Hero | Tools Grid |
|:--:|:--:|
| <img src="https://github.com/user-attachments/assets/bfc26746-d6f7-482e-aa71-3056cda73495" alt="Home hero with animated dropzone" width="100%"/> | <img src="https://github.com/user-attachments/assets/cfc9cc23-0c81-4930-91cc-df304c46644f" alt="Tools grid" width="100%"/> |

| Compress PDF — Live Preview | Sign PDF — Signature Placement |
|:--:|:--:|
| <img src="https://github.com/user-attachments/assets/ce0522d2-4541-4a3e-8354-73b77518dc0a" alt="Compress PDF preview" width="100%"/> | <img src="https://github.com/user-attachments/assets/68161f0b-2dd5-47a1-9b24-24f948719dc9" alt="Sign PDF" width="100%"/> |

| Equation → Image | Watermark PDF/Image |
|:--:|:--:|
| <img src="https://github.com/user-attachments/assets/cb8c3b5b-e3d3-476b-a1b9-fed11773f163" alt="Equation to image" width="100%"/> | <img src="https://github.com/user-attachments/assets/2f8995ca-241a-485d-a6a2-0ca3d73aa45f" alt="Watermark PDF/Image" width="100%"/> |

</div>

## 🛠 Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radixui&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

<details>
<summary><b>📦 Full dependency breakdown</b></summary>

**UI & Motion**
- `tailwindcss` + `shadcn/ui` + `@radix-ui/*` — accessible, themeable components
- `framer-motion` — hero animations, layout transitions, drag interactions
- `lucide-react` — icon set

**PDF & Imaging**
- `pdfjs-dist` — page rendering and previews (bundled worker, no CDN)
- `pdf-lib` — merge, split, watermark, encrypt, signature placement
- `jspdf` + `html2canvas` / `html-to-image` — DOM → PDF/PNG export

**Math**
- `katex` — client-side LaTeX math typesetting for the equation tool

</details>

## ⚡ Getting Started

```bash
# 1 · clone
git clone https://github.com/cu-sanjay/iHatePDF.git
cd iHatePDF

# 2 · install
npm install

# 3 · run
npm run dev
```

Then open **http://localhost:5000**.

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Production build (client + server bundle) |
| `npm start` | Serve the production build |
| `npm run check` | TypeScript typecheck |

> [!WARNING]
> Large PDFs are processed entirely in memory. On low-RAM devices, very large files (100 MB+) may be slow or fail — split them first.


## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feat/my-tool`
2. Keep everything **client-side** — no upload endpoints.
3. Match the design language: light theme, red `#E63228` / white / black, glass surfaces, rounded corners.
4. Run `npm run check` before opening a PR.

## 📄 License

Released under the **MIT License** — see [LICENSE](./LICENSE). Use it, fork it, ship it.

<div align="center">

**Built with ❤️ by [Sannjay](https://github.com/cu-sanjay)** · If this saved you a subscription, leave a ⭐

</div>
