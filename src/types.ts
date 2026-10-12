export interface UserProfile {
  id: string;
  email: string;
  created_at?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface WalletState {
  isCreated: boolean;
  isUnlocked: boolean;
  address: string;
  balance: number;
  mnemonicWords?: string[];
  lastBackupDate?: string;
}

export interface NodeMetrics {
  blockHeight: number;
  hashRate: string;
  peersCount: number;
  difficulty: number;
  network: 'regtest' | 'mainnet' | 'testnet';
  nodeVersion: string;
  btxcPriceBrl: number;
}
