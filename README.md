<div align="center">
  
# 🌟 Lumi Pro

**The Ultimate Next-Generation AI Assistant Platform**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=for-the-badge)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=black&style=for-the-badge)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

*A fully-featured, cross-platform AI chat application supporting cutting-edge cloud models and privacy-first local models.*

[Explore Features](#-key-features) • [Installation](#-quick-start) • [Tech Stack](#️-tech-stack) • [Mobile App](#-mobile-app)

</div>

---

## ✨ Overview

**Lumi Pro** redefines the AI chat experience. Whether you need the blazing fast intelligence of Google's **Gemini 2.0 Flash** or the privacy and localized control of **DeepSeek via Ollama**, Lumi Pro seamlessly bridges the gap. It provides a beautiful web interface and a powerful mobile application, all synchronized to empower your workflows.

---

## 🚀 Key Features

<table>
  <tr>
    <td width="50%">
      <h3>🧠 Multi-Model Intelligence</h3>
      Switch effortlessly between cloud giants (Gemini Pro/Flash) and local privacy-first models like DeepSeek. 
    </td>
    <td width="50%">
      <h3>🎨 Premium UI/UX</h3>
      Silky smooth animations with Framer Motion, dynamic glassmorphism, and instant Light/Dark mode toggling.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🎙️ Rich Media Native</h3>
      Full support for Speech-to-Text dictation, Text-to-Speech read-alouds, image analysis, and file attachments.
    </td>
    <td width="50%">
      <h3>🛠️ Developer & Study Tools</h3>
      Syntax-highlighted code blocks with 1-click copy/download. Built-in generators for Notes, Quizzes, and Flashcards.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>⚙️ Deep Customization</h3>
      Adjust AI creativity, set custom GPT instructions, and toggle response modes (Quick, Explain, Exam) on the fly.
    </td>
    <td width="50%">
      <h3>📱 Cross-Platform</h3>
      Use it at your desk via the Vite/React web app, or on the go with the Expo React Native mobile application.
    </td>
  </tr>
</table>

---

## 🏗️ Architecture

```text
├── 💻 Web App (Root)
│   ├── src/          # React 19 components, Gemini & Ollama integration
│   ├── public/       # Static assets
│   └── index.html    # Web entry point
│
└── 📱 Mobile App (/mobile)
    ├── App.tsx       # React Native entry point
    ├── lib/          # Mobile specific auth (Firebase) and AI hooks
    └── assets/       # Mobile assets and icons
```

---

## ⚡ Quick Start

### 1️⃣ Setting up the Web Application

> **Prerequisites:** Node.js (v18+) and an active Gemini API Key.

Clone the repository and install the web dependencies:

```bash
git clone https://github.com/yourusername/ai-chat-bot.git
cd ai-chat-bot
npm install
```

Configure your environment variables:
```bash
cp .env.example .env
# Open .env and add your VITE_GEMINI_API_KEY
```

Fire up the development server:
```bash
npm run dev
```
> 🌐 The application will be running at `http://localhost:5173`

---

### 2️⃣ Setting up the Mobile Application

> **Prerequisites:** Expo CLI installed.

Navigate to the mobile directory and get started:

```bash
cd mobile
npm install
npm start
```
> 📱 Scan the QR code with the **Expo Go** app on your phone, or press `i` to launch an iOS simulator.

---

## 🔒 Local Models (Privacy First)

Lumi Pro comes with plug-and-play support for **Ollama**, allowing you to run AI models entirely offline.

1. Download and install [Ollama](https://ollama.com/).
2. Pull and run your preferred model, e.g., DeepSeek:
   ```bash
   ollama run deepseek-r1:1.5b
   ```
3. Open Lumi Pro and select "Local DeepSeek" from the model dropdown. *Your data never leaves your machine!*

---

## 🛠️ Tech Stack

<div align="center">
  <br />
  <img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,firebase,nodejs,github" alt="Tech Stack" />
  <br />
</div>

- **Frontend Core:** React 19, TypeScript, Vite
- **Styling & Motion:** Tailwind CSS v4, Framer Motion, Lucide Icons
- **Mobile Environment:** React Native, Expo, Firebase Auth
- **AI Integration:** Google Generative AI SDK, Custom Ollama Hooks
- **Content Rendering:** React Markdown, Remark GFM

---

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a Pull Request if you'd like to improve the project.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <br />
  
</div>
