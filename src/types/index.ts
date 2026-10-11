export type BitcoinUnit = 'BTC' | 'mBTC' | 'sat' | 'bits';
export type FiatCurrency = 'USD' | 'BRL' | 'EUR' | 'GBP';
export type Language = 'pt' | 'en' | 'es';
export type NetworkType = 'mainnet' | 'testnet' | 'signet' | 'regtest';

export type WalletType = 'standard' | 'multisig_2_of_3' | 'segwit_native' | 'watch_only';
export type SeedType = 'bip39' | 'electrum';

export interface WalletKeyStore {
  seedPhrase?: string;
  seedType: SeedType;
  derivationPath: string;
  masterPublicKey: string; // zpub / xpub
  masterPrivateKey?: string; // zprv / xprv
  passphraseProtected: boolean;
  isEncrypted: boolean;
  fingerprint: string;
  cosigners?: {
    name: string;
    xpub: string;
    confirmed: boolean;
  }[];
}

export interface AddressItem {
  address: string;
  index: number;
  type: 'receiving' | 'change';
  derivationPath: string;
  balanceSat: number;
  txCount: number;
  label: string;
  frozen: boolean;
}

export interface UTXO {
  txid: string;
  vout: number;
  address: string;
  amountSat: number;
  confirmations: number;
  blockHeight: number;
  isFrozen: boolean;
  scriptType: 'p2wpkh' | 'p2sh-p2wpkh' | 'p2pkh';
}

export interface TransactionItem {
  id: string;
  txid: string;
  type: 'received' | 'sent' | 'lightning_in' | 'lightning_out';
  amountSat: number;
  feeSat: number;
  status: 'confirmed' | 'unconfirmed' | 'pending';
  timestamp: number;
  blockHeight?: number;
  confirmations: number;
  addressOrInvoice: string;
  label: string;
  rawHex?: string;
}

export interface LightningChannel {
  id: string;
  peerAlias: string;
  peerPubkey: string;
  capacitySat: number;
  localBalanceSat: number;
  remoteBalanceSat: number;
  status: 'open' | 'opening' | 'closing';
  feePpm: number;
}

export interface LightningInvoice {
  paymentHash: string;
  bolt11: string;
  amountSat: number;
  memo: string;
  createdAt: number;
  expiresAt: number;
  status: 'paid' | 'unpaid' | 'expired';
}

export interface ElectrumServer {
  host: string;
  port: number;
  protocol: 'ssl' | 'tcp';
  pingMs: number;
  status: 'connected' | 'connecting' | 'disconnected';
  height: number;
}

export interface FeeRates {
  fastest: number; // sat/vB
  halfHour: number;
  hour: number;
  minimum: number;
}
