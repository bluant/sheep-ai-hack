# Sheep AI Hack

A template project for building an AI chat application with FastAPI backend and React frontend.

## Project Overview

This project consists of:
- **Backend**: FastAPI application that serves as a proxy to Ollama LLM service
- **Frontend**: React application with a chat interface

## Prerequisites

- **Python 3.12.3**
- **Node.js 22.15.0**
- **Ollama** with **Llama3** model installed

### Installing Ollama with Llama3

1. Install Ollama by following the instructions at [ollama.com](https://ollama.com)
2. Pull the Llama3 model:
   ```bash
   ollama pull llama3
   ```

## Setup

### Backend Setup

1. Create a Python virtual environment:
   ```bash
   python -m venv backend/.venv
   ```

2. Activate the virtual environment:
   ```bash
   # On macOS/Linux
   source backend/.venv/bin/activate

   # On Windows
   backend\.venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root with:
   ```
   LLM_URL=http://localhost:11434
   LLM_MODEL=llama3
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

You can start both the backend and frontend with the provided script:

```bash
./hack-start.sh
```

Or start them separately:

### Backend

```bash
source backend/.venv/bin/activate
cd backend
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm run dev
```

## RAG Setup

To enable Retrieval-Augmented Generation (RAG) locally, follow these steps:

1. **Pull the embedding model**

   ```bash
   ollama pull nomic-embed-text
   ```

2. **Build the FAISS index**

   ```bash
   python tools/build_index.py
   ```

   This script reads your `knowledge.txt` (or other source files) and outputs a `faiss_index/` directory with the vector store.

3. **Ensure `faiss_index/` is ignored**

   Add this line to your `.gitignore` if it’s not already present:

   ```gitignore
   faiss_index/
   ```

Once complete, your `/ask` endpoint will be able to retrieve relevant chunks from your local FAISS index and serve grounded answers via Ollama.

## Usage

1. Open your browser to the URL shown in the frontend console (typically http://localhost:5173)
2. Type a question in the chat box and press Send
3. The application will stream a response from the Llama3 model

## Development

- Backend code is in the `backend/app` directory
- Frontend code is in the `frontend/src` directory  
