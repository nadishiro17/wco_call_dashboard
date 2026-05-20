# WCO Call Dashboard

Internal dashboard for reviewing ElevenLabs call history and launching call-manager runs.

## Setup

```bash
npm install
npm --prefix client install
cp .env.example .env
```

Fill in `.env` with your ElevenLabs API key and dashboard access code.

## Development

Build the Vite client and start the Express server:

```bash
npm run build
npm start
```

Then open:

```text
http://127.0.0.1:3000/?code=YOUR_ACCESS_CODE
```

The dashboard proxies call-manager requests to `MANAGER_API_URL`, defaulting to `http://127.0.0.1:8001`.
