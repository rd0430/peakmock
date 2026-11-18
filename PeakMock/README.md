# PeakMock — IELTS & Digital SAT Mock & Practice Platform

PeakMock is a full-stack exam preparation platform featuring strict-timed Mock exams, flexible Mixed Practice mode, a Bluebook-style Digital SAT interface, AI-powered IELTS Writing & Speaking evaluation, and an AI-assisted Admin Test Importer powered by **Gemini 3 Flash (`gemini-3-flash-preview`)**.

## Railway Deployment Guide

1. Push this folder to a GitHub repository.
2. Open [Railway](https://railway.app) -> **New Project** -> **Deploy from GitHub repo**.
3. Go to **Variables** in your Railway service and add:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `JWT_SECRET`: A strong random string.
   - `ADMIN_EMAIL`: `rozimatovdoniyor4@gmail.com` (default).
   - *(Optional)* `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` for live Google OAuth.
   - *(Optional)* `APPLE_CLIENT_ID`, `APPLE_REDIRECT_URI` for live Apple/iCloud OAuth.
4. Railway will automatically run `npm install` and `npm start` on the assigned `$PORT`.

## Admin Panel Access
- Log in or register using `rozimatovdoniyor4@gmail.com` (or click **Continue with Google** and enter `rozimatovdoniyor4@gmail.com` when OAuth keys are not configured).
- The **Admin Studio** tab appears exclusively for `rozimatovdoniyor4@gmail.com`, while preserving full student test-taking access.
