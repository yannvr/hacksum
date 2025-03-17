# HackSum

A real-time news summarization app powered by Grok AI. Get concise summaries of the latest news across different topics with sentiment analysis.

⚠️ This app requires Grok3 API which is not available yet. Stay tuned!


## Features

- Real-time news summaries using Grok AI
- Sentiment analysis for each news article
- Overall sentiment tracking per topic
- Clean, modern UI with responsive design
- Built with Bun for optimal performance
- Automatic caching (1-hour cache duration)

## Tech Stack

- **Frontend**: Vanilla JavaScript with modern CSS
- **Backend**: Bun + TypeScript
- **API**: Grok AI for news summarization
- **Caching**: In-memory Map with 1-hour duration

## Topics Covered

- Cryptocurrency
- DeFi
- Artificial Intelligence
- Technology
- Startups

## Prerequisites

- [Bun](https://bun.sh) runtime installed
- Grok API key (see Environment Variables section)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hacksum.git
cd hacksum
```

2. Install dependencies:
```bash
bun install
```

3. Configure environment variables:
```bash
cp .env.example .env
```
Then edit the `.env` file to add your Grok API key.

4. Run the server:
```bash
bun run index.ts
```

5. Open your browser and navigate to `http://localhost:3000`

## Environment Variables

The application uses the following environment variables:

- `GROK_API_KEY`: Your Grok AI API key (required)

These should be defined in a `.env` file in the project root.

## Usage

1. Select a topic from the dropdown menu
2. View real-time news summaries with sentiment analysis
3. Click on any news item to read the full article (opens a Google search for the summary)
4. Observe the overall sentiment indicator for the selected topic

## How It Works

1. The app sends a request to the Grok AI API asking for news summaries on the selected topic
2. Sentiment analysis is performed on each news item using keyword-based analysis
3. Results are cached for 1 hour to optimize performance
4. The UI displays each summary with a color-coded sentiment indicator

## License

MIT 