---
title: WOW - AI Chatbot API
emoji: 💫
colorFrom: purple
colorTo: pink
sdk: docker
app_port: 7860
---

# WOW - AI Chatbot API

Backend API for the WOW AI Chatbot application. This provides the MLVOCA API proxy and handles chat streaming.

## Deployment on Hugging Face Spaces

This space runs the Express backend API that:
- Proxies requests to MLVOCA API
- Handles CORS for browser clients
- Provides streaming chat responses

The frontend is deployed separately on GitHub Pages at: https://alimehdi512.github.io/WOW/
