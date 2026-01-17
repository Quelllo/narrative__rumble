import { Router } from 'express';

export const themesRouter = Router();

export type Theme = {
  id: string;
  name: string;
  description: string;
  leftLegLabel: string;
  rightLegLabel: string;
  leftBasket: { symbol: string; weight: number; side: 'LONG' | 'SHORT' }[];
  rightBasket: { symbol: string; weight: number; side: 'LONG' | 'SHORT' }[];
};

export const themes: Theme[] = [
  {
    id: 'ai-vs-meme',
    name: 'AI vs Meme',
    description: 'Artificial Intelligence tokens versus Meme coins',
    leftLegLabel: 'AI',
    rightLegLabel: 'Meme',
    leftBasket: [
      { symbol: 'FET', weight: 0.3, side: 'LONG' },
      { symbol: 'AGIX', weight: 0.25, side: 'LONG' },
      { symbol: 'OCEAN', weight: 0.2, side: 'LONG' },
      { symbol: 'RNDR', weight: 0.15, side: 'LONG' },
      { symbol: 'TAO', weight: 0.1, side: 'LONG' },
    ],
    rightBasket: [
      { symbol: 'DOGE', weight: 0.3, side: 'LONG' },
      { symbol: 'SHIB', weight: 0.25, side: 'LONG' },
      { symbol: 'PEPE', weight: 0.2, side: 'LONG' },
      { symbol: 'FLOKI', weight: 0.15, side: 'LONG' },
      { symbol: 'BONK', weight: 0.1, side: 'LONG' },
    ],
  },
  {
    id: 'eth-vs-btc',
    name: 'ETH vs BTC',
    description: 'Ethereum ecosystem versus Bitcoin',
    leftLegLabel: 'ETH',
    rightLegLabel: 'BTC',
    leftBasket: [
      { symbol: 'ETH', weight: 0.5, side: 'LONG' },
      { symbol: 'LINK', weight: 0.2, side: 'LONG' },
      { symbol: 'UNI', weight: 0.15, side: 'LONG' },
      { symbol: 'AAVE', weight: 0.1, side: 'LONG' },
      { symbol: 'MKR', weight: 0.05, side: 'LONG' },
    ],
    rightBasket: [
      { symbol: 'BTC', weight: 1.0, side: 'LONG' },
    ],
  },
  {
    id: 'sol-vs-l2s',
    name: 'SOL Ecosystem vs L2s',
    description: 'Solana ecosystem versus Ethereum Layer 2 solutions',
    leftLegLabel: 'SOL Ecosystem',
    rightLegLabel: 'L2s',
    leftBasket: [
      { symbol: 'SOL', weight: 0.4, side: 'LONG' },
      { symbol: 'RAY', weight: 0.2, side: 'LONG' },
      { symbol: 'JUP', weight: 0.15, side: 'LONG' },
      { symbol: 'BONK', weight: 0.15, side: 'LONG' },
      { symbol: 'WIF', weight: 0.1, side: 'LONG' },
    ],
    rightBasket: [
      { symbol: 'ARB', weight: 0.35, side: 'LONG' },
      { symbol: 'OP', weight: 0.3, side: 'LONG' },
      { symbol: 'MATIC', weight: 0.2, side: 'LONG' },
      { symbol: 'STRK', weight: 0.15, side: 'LONG' },
    ],
  },
];

export function getThemeById(id: string): Theme | undefined {
  return themes.find((theme) => theme.id === id);
}

themesRouter.get('/', (req, res) => {
  res.json(themes);
});
