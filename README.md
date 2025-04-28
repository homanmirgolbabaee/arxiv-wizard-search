# ArXiv Wizard Search

A powerful learning tool that helps you digest academic papers and web content more effectively.

## Table of Contents

- [Features](#features)
  - [ArXiv Research Assistant](#-arxiv-research-assistant)
  - [URL Quiz Generator](#-url-quiz-generator)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [API Key Setup](#api-key-setup)
  - [Using ArXiv Search](#using-arxiv-search)
  - [Using URL Quiz Generator](#using-url-quiz-generator)
- [Security Notes](#security-notes)
- [Technology Stack](#technology-stack)
- [Development](#development)
- [License](#license)

<p align="center" style="margin-bottom: 0; position: relative;">
  <a href="https://youtu.be/ozeE4vr104o" target="_blank">
    <img src="https://img.youtube.com/vi/ozeE4vr104o/0.jpg" width="400" alt="Demo Video">
    <img src="https://raw.githubusercontent.com/SuperManito/Arcadia/main/img/video-play-button.png" width="68" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);" alt="Play Button">
  </a>
</p>
<p align="center"><strong>Demo Video on Youtube(Click to Watch)</strong></p>

## Features

### 📄 ArXiv Research Assistant

Search through the arXiv database of academic papers and get AI-powered insights:

1. **Search for Papers** - Find relevant research by topic, author, title, or category
2. **Interactive PDF Viewer** - Read papers directly in the browser
3. **AI Text Analysis** - Select any text from the paper to get:
   - Summary and breakdown in simpler words
   - Main topic and purpose identification
   - Technical term explanations
   - How it connects to broader research
4. **Text-to-Speech** - Listen to the analysis with high-quality ElevenLabs voice

### 🌐 URL Quiz Generator

Turn any webpage into interactive flash cards for better learning:

1. **Enter Any URL** - Point to documentation, articles, or educational content
2. **Automatic Quiz Generation** - The app creates a set of multiple-choice questions
3. **Interactive Flash Cards** - Test your knowledge with a clean, interactive interface
4. **Learn More Effectively** - Reinforce your understanding of the content

## Getting Started

### Installation

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd arxiv-wizard-search

# Install dependencies
npm install

# Start the development server
npm run dev
```

### API Key Setup

**Important:** This application requires you to provide your own API keys. No keys are included with the code.

You'll need to configure the following API keys to use the full functionality:

1. **Toolhouse API Key** - For AI-powered analysis and quiz generation. [Get Your Toolhouse API Key](https://app.toolhouse.ai/settings/api-keys)
2. **OpenAI API Key** - For the underlying AI models. [Get Your OpenAI API Key](https://platform.openai.com/api-keys)
3. **ElevenLabs API Key** (Optional) - For high-quality text-to-speech. [Get Your Elevenlabs API Key](https://elevenlabs.io/app/settings/api-keys)

You'll be prompted to enter these keys when you first use the application. They are stored securely in your browser's local storage and are not transmitted to any server other than the respective API services.

### How to use ArXiv Search

1. Select the "ArXiv" tab on the home page
2. Enter search terms in the search box
3. Use filters to narrow down results if needed
4. Click "Go to Editor" on any paper to analyze it
5. Select text in the PDF to analyze with AI

### How to use URL Quiz Generator

1. Select the "URL" tab on the home page
2. Enter any webpage URL
3. Click "Generate Quiz"
4. Interact with the resulting flash cards to test your knowledge

## Security Notes

- This is a demonstration application for educational purposes
- API keys are stored in your browser's localStorage/sessionStorage
- No data is sent to any servers other than the API providers you configure
- For production use, a backend service would provide better security for API key management
- The application does not collect or store user data beyond the browser's local storage

## Technology Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Toolhouse AI SDK
- OpenAI API
- ElevenLabs TTS API

## Development

To run this project locally:

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd arxiv-wizard-search

# Install dependencies
npm install

# Start the development server
npm run dev
```

## License

[MIT License](LICENSE)
