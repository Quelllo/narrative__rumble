import { Router } from 'express';

export const betsRouter = Router();

export interface Bet {
  id: string;
  themeId: string;
  side: 'left' | 'right';
  stake: number;
  status: 'pending' | 'open' | 'closed';
  createdAt: string;
}

const bets: Bet[] = [];

betsRouter.get('/', (req, res) => {
  res.json(bets);
});

betsRouter.post('/', (req, res) => {
  const { themeId, side, stake } = req.body;

  if (!themeId || !side || !stake) {
    return res.status(400).json({ error: 'Missing required fields: themeId, side, stake' });
  }

  if (side !== 'left' && side !== 'right') {
    return res.status(400).json({ error: 'side must be "left" or "right"' });
  }

  if (typeof stake !== 'number' || stake <= 0) {
    return res.status(400).json({ error: 'stake must be a positive number' });
  }

  const bet: Bet = {
    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    themeId,
    side,
    stake,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  bets.push(bet);
  res.status(201).json(bet);
});
