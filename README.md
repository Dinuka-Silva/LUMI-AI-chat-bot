# Lumi Pro - Advanced AI Chatbot Platform

Lumi Pro is a comprehensive, advanced AI chatbot platform featuring both a sleek web application and a cross-platform mobile application. It seamlessly integrates powerful cloud models (Google Gemini) and privacy-first local models (via Ollama) into a unified, feature-rich interface.

## 🌟 Key Features

*   **Multi-Model Support:** Effortlessly switch between Google Gemini models (Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash) and local models like DeepSeek (via Ollama).
*   **Rich Media Interactions:** Support for text, voice (Speech-to-Text & Text-to-Speech), image analysis, and file attachments.
*   **Advanced AI Capabilities:** Features like "Chain of Thought" visibility, Agent Mode, Deep Research simulations, and "Explain Like I'm 5" (ELI5) Canvas.
*   **Customization:** Tailor the AI's personality, tone, language, and custom instructions (Custom GPT mode). Adjust creativity levels and response modes (Quick, Explain, Exam).
*   **Developer Friendly:** Beautiful code blocks with syntax highlighting, one-click copy, and download functionality.
*   **Study Tools:** Built-in Notes Generator, Quiz Generator, and Flashcards creator.
*   **Persistent Memory:** Local storage for conversation history, goals tracking, and learned user preferences.
*   **Cross-Platform UI:** Premium UI built with Tailwind CSS and Framer Motion, featuring seamless Light and Dark mode transitions.

## 🏗️ Project Structure

The repository is organized into two main parts:

### 1. Web Application (`/`)
Built with Vite, React 19, TypeScript, and Tailwind CSS.
*   `src/`: Contains the React components, styles, and API logic (Gemini and Ollama integrations).
*   `index.html`: Main entry point for the Vite app.

### 2. Mobile Application (`/mobile`)
Built with Expo, React Native, and Firebase.
*   Features native integration for Firebase Authentication and Google Sign-in.
*   Connects to local Ollama server and cloud Gemini APIs.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)
*   [Ollama](https://ollama.com/) installed locally (if you plan to use local models like DeepSeek)
*   Google Gemini API Key (for cloud models)

### Setup the Web Application

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the root directory based on `.env.example`:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The web app will be available at `http://localhost:5173`.

### Setup the Mobile Application

1.  **Navigate to the mobile directory:**
    ```bash
    cd mobile
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Expo server:**
    ```bash
    npm start
    ```
    Use the Expo Go app on your physical device or run it on an iOS Simulator / Android Emulator.

## 🧠 Local Models via Ollama

To use local privacy-first models, ensure Ollama is running on your machine.
For example, to run DeepSeek:
```bash
ollama run deepseek-r1:1.5b
```
The application will automatically detect and communicate with the local server (defaulting to `http://localhost:11434`). Note: For the mobile app to connect to a local Ollama server on a physical device, you may need to configure your network and `OLLAMA_HOST` variable accordingly.

## 🛠️ Tech Stack

*   **Frontend Web:** React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide React, React Markdown.
*   **Frontend Mobile:** React Native, Expo, Expo File System, React Native Firebase.
*   **AI Integration:** `@google/generative-ai` SDK, Ollama REST API.

## 📄 License

This project is open-source and available under the MIT License.
