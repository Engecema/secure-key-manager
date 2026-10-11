import { BitcoinUnit, FiatCurrency } from '../types';

export const BIP39_WORDS_SAMPLE = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
  'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
  'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
  'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest',
  'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset',
  'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
  'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake',
  'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby', 'bachelor', 'bacon', 'badge',
  'bag', 'balance', 'balcony', 'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain',
  'barrel', 'base', 'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
  'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt', 'bench', 'benefit',
  'best', 'betray', 'better', 'between', 'beyond', 'bicycle', 'bid', 'bike', 'bind', 'biology',
  'bird', 'birth', 'bitter', 'black', 'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless',
  'blind', 'blood', 'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
  'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow', 'boss',
  'bounce', 'box', 'boy', 'bracket', 'brain', 'brand', 'brass', 'brave', 'bread', 'breeze',
  'brick', 'bridge', 'brief', 'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom',
  'brother', 'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb', 'bulk',
  'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus', 'business', 'busy', 'butter',
  'buyer', 'buzz', 'cabbage', 'cabin', 'cable', 'cactus', 'cage', 'cake', 'call', 'calm',
  'camera', 'camp', 'can', 'canal', 'cancel', 'candy', 'cannon', 'canoe', 'canvas', 'canyon',
  'capable', 'capital', 'captain', 'car', 'carbon', 'card', 'cargo', 'carpet', 'carry', 'cart',
  'case', 'cash', 'casino', 'castle', 'casual', 'cat', 'catalog', 'catch', 'category', 'cattle',
  'caught', 'cause', 'caution', 'cave', 'ceiling', 'celery', 'cement', 'census', 'century', 'cereal',
  'certain', 'chair', 'chalk', 'champion', 'change', 'chaos', 'chapter', 'charge', 'chase', 'chat',
  'cheap', 'check', 'cheese', 'chef', 'cherry', 'chest', 'chicken', 'chief', 'child', 'chimney',
  'choice', 'choose', 'chronic', 'chuckle', 'chunk', 'churn', 'cigar', 'cinnamon', 'circle', 'citizen'
];

export function generateMnemonic(length: 12 | 24 = 12): string {
  const words: string[] = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BIP39_WORDS_SAMPLE.length);
    words.push(BIP39_WORDS_SAMPLE[randomIndex]);
  }
  return words.join(' ');
}

export function formatSatoshis(sat: number, unit: BitcoinUnit): string {
  switch (unit) {
    case 'BTC':
      return (sat / 100_000_000).toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 });
    case 'mBTC':
      return (sat / 100_000).toLocaleString('en-US', { minimumFractionDigits: 5, maximumFractionDigits: 5 });
    case 'bits':
      return (sat / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'sat':
    default:
      return sat.toLocaleString('en-US');
  }
}

export const FIAT_RATES: Record<FiatCurrency, { rate: number; symbol: string }> = {
  USD: { rate: 92450.00, symbol: '$' },
  BRL: { rate: 536210.00, symbol: 'R$' },
  EUR: { rate: 85200.00, symbol: '€' },
  GBP: { rate: 71150.00, symbol: '£' },
};

export function formatFiat(sat: number, currency: FiatCurrency): string {
  const btc = sat / 100_000_000;
  const config = FIAT_RATES[currency];
  const value = btc * config.rate;
  return `${config.symbol} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function parseAmountToSat(amount: number, unit: BitcoinUnit): number {
  switch (unit) {
    case 'BTC':
      return Math.round(amount * 100_000_000);
    case 'mBTC':
      return Math.round(amount * 100_000);
    case 'bits':
      return Math.round(amount * 100);
    case 'sat':
    default:
      return Math.round(amount);
  }
}

export function isValidBitcoinAddress(address: string): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  // Native SegWit (bc1q or bc1p)
  if (trimmed.startsWith('bc1') && trimmed.length >= 26 && trimmed.length <= 90) return true;
  // Testnet / Regtest tb1 / bcrt1
  if ((trimmed.startsWith('tb1') || trimmed.startsWith('bcrt1')) && trimmed.length >= 26) return true;
  // Nested SegWit (3...)
  if (trimmed.startsWith('3') && trimmed.length >= 26 && trimmed.length <= 35) return true;
  // Legacy (1...)
  if (trimmed.startsWith('1') && trimmed.length >= 26 && trimmed.length <= 35) return true;
  return false;
}

export function isValidLightningInvoice(invoice: string): boolean {
  if (!invoice) return false;
  const trimmed = invoice.trim().toLowerCase();
  return trimmed.startsWith('lnbc') || trimmed.startsWith('lntb') || trimmed.startsWith('lnbcrt');
}

export function generateRandomHex(length = 64): string {
  const chars = '0123456789abcdef';
  let res = '';
  for (let i = 0; i < length; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

export function generateBech32Address(index: number, isChange = false): string {
  const prefix = isChange ? 'bc1q9w7f' : 'bc1qxy2k';
  const seed = (index * 987654321 + (isChange ? 12345 : 0)).toString(16);
  const padding = '00000000'.slice(seed.length);
  return `${prefix}${padding}${seed}gq59mhp8t3vzlpt9z`.slice(0, 42);
}

// Generate simple SVG QR matrix pattern
export function generateQrMatrix(text: string, size = 25): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  
  // Draw corner position markers
  function drawFinderPattern(startX: number, startY: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        }
      }
    }
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(size - 7, 0);
  drawFinderPattern(0, size - 7);

  // Deterministic pattern based on hash of text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8)
      ) {
        continue;
      }
      const val = (r * 31 + c * 17 + hash + (r ^ c)) % 100;
      matrix[r][c] = val % 2 === 0;
    }
  }

  return matrix;
}
