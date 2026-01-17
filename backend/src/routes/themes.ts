import { Router } from 'express';

export const themesRouter = Router();

interface Theme {
  id: string;
  leftNarrative: string;
  rightNarrative: string;
}

const themes: Theme[] = [
  { id: 'ai-vs-meme', leftNarrative: 'AI', rightNarrative: 'Meme' },
  { id: 'eth-vs-btc', leftNarrative: 'ETH', rightNarrative: 'BTC' },
  { id: 'sol-vs-l2s', leftNarrative: 'SOL Ecosystem', rightNarrative: 'L2s' },
];

themesRouter.get('/', (req, res) => {
  res.json(themes);
});
