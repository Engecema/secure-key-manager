import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BitcoinUnit,
  FiatCurrency,
  Language,
  NetworkType,
  WalletType,
  WalletKeyStore,
  AddressItem,
  UTXO,
  TransactionItem,
  LightningChannel,
  LightningInvoice,
  ElectrumServer,
  FeeRates,
} from '../types';
import {
  generateMnemonic,
  generateRandomHex,
  generateBech32Address,
  isValidBitcoinAddress,
  isValidLightningInvoice,
} from '../utils/bitcoin';

interface WalletContextType {
  walletName: string;
  walletType: WalletType;
  network: NetworkType;
  unit: BitcoinUnit;
  fiat: FiatCurrency;
  lang: Language;
  keystore: WalletKeyStore;
  addresses: AddressItem[];
  utxos: UTXO[];
  transactions: TransactionItem[];
  channels: LightningChannel[];
  invoices: LightningInvoice[];
  activeServer: ElectrumServer;
  feeRates: FeeRates;
  torEnabled: boolean;
  isLocked: boolean;
  
  // Computed balances
  onchainBalanceSat: number;
  unconfirmedBalanceSat: number;
  lightningBalanceSat: number;
  totalBalanceSat: number;

  // Actions
  setUnit: (u: BitcoinUnit) => void;
  setFiat: (f: FiatCurrency) => void;
  setLang: (l: Language) => void;
  setNetwork: (n: NetworkType) => void;
  setTorEnabled: (val: boolean) => void;
  toggleLock: () => void;
  
  sendTransaction: (
    recipient: string,
    amountSat: number,
    feeSat: number,
    label: string,
    selectedUtxoKeys?: string[]
  ) => { success: boolean; error?: string; txid?: string };
  
  createReceiveRequest: (
    amountSat: number,
    memo: string,
    isLightning: boolean
  ) => { addressOrInvoice: string; expiresAt: number };
  
  toggleFreezeUtxo: (txid: string, vout: number) => void;
  toggleFreezeAddress: (address: string) => void;
  updateAddressLabel: (address: string, label: string) => void;
  
  openLightningChannel: (
    peerAlias: string,
    peerPubkey: string,
    capacitySat: number
  ) => { success: boolean; error?: string };
  
  closeLightningChannel: (channelId: string) => void;
  
  signMessageWithKey: (message: string, address: string) => string;
  verifySignedMessage: (message: string, address: string, signature: string) => boolean;
  
  createNewWallet: (name: string, type: WalletType, seedWords?: string, passphrase?: string) => void;
  switchElectrumServer: (host: string, port: number) => void;
}

const STORAGE_KEY = 'sk_electrum_wallet_v1';

const INITIAL_ADDRESSES: AddressItem[] = [
  {
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    index: 0,
    type: 'receiving',
    derivationPath: "m/84'/0'/0'/0/0",
    balanceSat: 65000,
    txCount: 3,
    label: 'Exchange withdrawal (Kraken)',
    frozen: false,
  },
  {
    address: 'bc1q9w7ffg4k3t8r7q0p2v1w5s8d6z4y7c2e9j3a1m',
    index: 1,
    type: 'receiving',
    derivationPath: "m/84'/0'/0'/0/1",
    balanceSat: 42500,
    txCount: 1,
    label: 'Mining payout / Coldcard',
    frozen: false,
  },
  {
    address: 'bc1q7x4p8v2m9k3j5s8d6z4y7c2e9j3a1mg4k3t8r7',
    index: 2,
    type: 'receiving',
    derivationPath: "m/84'/0'/0'/0/2",
    balanceSat: 35000,
    txCount: 2,
    label: 'Consulting payment',
    frozen: false,
  },
  {
    address: 'bc1q3a1mg4k3t8r7q0p2v1w5s8d6z4y7c2e9j3a1m9',
    index: 3,
    type: 'receiving',
    derivationPath: "m/84'/0'/0'/0/3",
    balanceSat: 0,
    txCount: 0,
    label: 'Next unused receive address',
    frozen: false,
  },
  {
    address: 'bc1q8r7q0p2v1w5s8d6z4y7c2e9j3a1mg4k3t8r7c1',
    index: 0,
    type: 'change',
    derivationPath: "m/84'/0'/0'/1/0",
    balanceSat: 0,
    txCount: 2,
    label: 'Internal change output',
    frozen: false,
  },
];

const INITIAL_UTXOS: UTXO[] = [
  {
    txid: '3c8e763bfa472e39b9c9f2c695b2c7e09efea192938a1670984a921d26ec67e4',
    vout: 0,
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    amountSat: 65000,
    confirmations: 42,
    blockHeight: 894100,
    isFrozen: false,
    scriptType: 'p2wpkh',
  },
  {
    txid: '9b2c7e09efea192938a1670984a921d26ec67e43c8e763bfa472e39b9c9f2c6e',
    vout: 1,
    address: 'bc1q9w7ffg4k3t8r7q0p2v1w5s8d6z4y7c2e9j3a1m',
    amountSat: 42500,
    confirmations: 18,
    blockHeight: 894124,
    isFrozen: false,
    scriptType: 'p2wpkh',
  },
  {
    txid: 'a192938a1670984a921d26ec67e43c8e763bfa472e39b9c9f2c695b2c7e09efe',
    vout: 0,
    address: 'bc1q7x4p8v2m9k3j5s8d6z4y7c2e9j3a1mg4k3t8r7',
    amountSat: 35000,
    confirmations: 6,
    blockHeight: 894136,
    isFrozen: false,
    scriptType: 'p2wpkh',
  },
];

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'tx-1',
    txid: '3c8e763bfa472e39b9c9f2c695b2c7e09efea192938a1670984a921d26ec67e4',
    type: 'received',
    amountSat: 65000,
    feeSat: 1250,
    status: 'confirmed',
    timestamp: Date.now() - 86400000 * 2,
    blockHeight: 894100,
    confirmations: 42,
    addressOrInvoice: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    label: 'Exchange withdrawal (Kraken)',
  },
  {
    id: 'tx-2',
    txid: '9b2c7e09efea192938a1670984a921d26ec67e43c8e763bfa472e39b9c9f2c6e',
    type: 'received',
    amountSat: 42500,
    feeSat: 840,
    status: 'confirmed',
    timestamp: Date.now() - 86400000 * 1,
    blockHeight: 894124,
    confirmations: 18,
    addressOrInvoice: 'bc1q9w7ffg4k3t8r7q0p2v1w5s8d6z4y7c2e9j3a1m',
    label: 'Mining payout / Coldcard',
  },
  {
    id: 'tx-3',
    txid: 'f87a192938a1670984a921d26ec67e43c8e763bfa472e39b9c9f2c695b2c7e09',
    type: 'lightning_out',
    amountSat: 15000,
    feeSat: 5,
    status: 'confirmed',
    timestamp: Date.now() - 3600000 * 5,
    confirmations: 1,
    addressOrInvoice: 'lnbc150u1pjn3y...lightning coffee payment',
    label: 'Lightning Coffee payment',
  },
  {
    id: 'tx-4',
    txid: 'a192938a1670984a921d26ec67e43c8e763bfa472e39b9c9f2c695b2c7e09efe',
    type: 'received',
    amountSat: 35000,
    feeSat: 620,
    status: 'confirmed',
    timestamp: Date.now() - 3600000 * 1,
    blockHeight: 894136,
    confirmations: 6,
    addressOrInvoice: 'bc1q7x4p8v2m9k3j5s8d6z4y7c2e9j3a1mg4k3t8r7',
    label: 'Consulting invoice payment',
  },
];

const INITIAL_CHANNELS: LightningChannel[] = [
  {
    id: 'chnl-894100x42x0',
    peerAlias: 'ACINQ (Electrum Hub)',
    peerPubkey: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
    capacitySat: 250000,
    localBalanceSat: 75000,
    remoteBalanceSat: 175000,
    status: 'open',
    feePpm: 250,
  },
  {
    id: 'chnl-894112x18x1',
    peerAlias: 'Bitrefill LND',
    peerPubkey: '028b68eb4c1e4c9e4c84a5da6711516e864703a7d45ff2940263cc8d1a123f859a',
    capacitySat: 100000,
    localBalanceSat: 45000,
    remoteBalanceSat: 55000,
    status: 'open',
    feePpm: 120,
  },
];

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletName, setWalletName] = useState('default_wallet.dat');
  const [walletType, setWalletType] = useState<WalletType>('segwit_native');
  const [network, setNetwork] = useState<NetworkType>('mainnet');
  const [unit, setUnit] = useState<BitcoinUnit>('sat');
  const [fiat, setFiat] = useState<FiatCurrency>('BRL');
  const [lang, setLang] = useState<Language>('pt');
  const [torEnabled, setTorEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [keystore, setKeystore] = useState<WalletKeyStore>({
    seedPhrase: 'abandon ability able about above absent absorb abstract absurd abuse access accident',
    seedType: 'bip39',
    derivationPath: "m/84'/0'/0'",
    masterPublicKey: 'zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYSDhtABDghZKSgRe328pm3WKAbEQRnoMm5qNET287',
    masterPrivateKey: 'zprvAWgYBBZaCAwhWGeP7K7rA7Uo7e5G9s2E5Q8m2rT1vC7P...[Hidden]',
    passphraseProtected: false,
    isEncrypted: false,
    fingerprint: '739f82ab',
  });

  const [addresses, setAddresses] = useState<AddressItem[]>(INITIAL_ADDRESSES);
  const [utxos, setUtxos] = useState<UTXO[]>(INITIAL_UTXOS);
  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);
  const [channels, setChannels] = useState<LightningChannel[]>(INITIAL_CHANNELS);
  const [invoices, setInvoices] = useState<LightningInvoice[]>([]);

  const [activeServer, setActiveServer] = useState<ElectrumServer>({
    host: 'electrum.blockstream.info',
    port: 50002,
    protocol: 'ssl',
    pingMs: 42,
    status: 'connected',
    height: 894142,
  });

  const feeRates: FeeRates = {
    fastest: 28, // sat/vB
    halfHour: 19,
    hour: 12,
    minimum: 5,
  };

  // Load from local storage if existing
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.walletName) setWalletName(parsed.walletName);
        if (parsed.walletType) setWalletType(parsed.walletType);
        if (parsed.unit) setUnit(parsed.unit);
        if (parsed.fiat) setFiat(parsed.fiat);
        if (parsed.lang) setLang(parsed.lang);
        if (parsed.keystore) setKeystore(parsed.keystore);
        if (parsed.addresses) setAddresses(parsed.addresses);
        if (parsed.utxos) setUtxos(parsed.utxos);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.channels) setChannels(parsed.channels);
      }
    } catch (e) {
      console.warn('Failed to parse saved wallet storage', e);
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    try {
      const dataToSave = {
        walletName,
        walletType,
        unit,
        fiat,
        lang,
        keystore,
        addresses,
        utxos,
        transactions,
        channels,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed to save to local storage', e);
    }
  }, [walletName, walletType, unit, fiat, lang, keystore, addresses, utxos, transactions, channels]);

  // Periodic simulated block height update
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveServer((prev) => ({
        ...prev,
        height: prev.height + (Math.random() > 0.85 ? 1 : 0),
        pingMs: Math.max(20, Math.min(120, prev.pingMs + Math.floor(Math.random() * 7 - 3))),
      }));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Computed balances
  const onchainBalanceSat = utxos
    .filter((u) => !u.isFrozen)
    .reduce((sum, u) => sum + u.amountSat, 0);

  const unconfirmedBalanceSat = transactions
    .filter((tx) => tx.status === 'unconfirmed')
    .reduce((sum, tx) => (tx.type === 'received' ? sum + tx.amountSat : sum - tx.amountSat), 0);

  const lightningBalanceSat = channels
    .filter((c) => c.status === 'open')
    .reduce((sum, c) => sum + c.localBalanceSat, 0);

  const totalBalanceSat = onchainBalanceSat + lightningBalanceSat;

  const toggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  const sendTransaction = (
    recipient: string,
    amountSat: number,
    feeSat: number,
    label: string,
    selectedUtxoKeys?: string[]
  ) => {
    if (isLocked) {
      return { success: false, error: 'Carteira bloqueada. Desbloqueie primeiro.' };
    }

    // Check if lightning invoice
    if (isValidLightningInvoice(recipient)) {
      if (lightningBalanceSat < amountSat) {
        return { success: false, error: 'Saldo Lightning insuficiente em canais abertos.' };
      }

      // Deduct from channels
      let remaining = amountSat;
      const updatedChannels = channels.map((ch) => {
        if (remaining <= 0 || ch.status !== 'open') return ch;
        const deduct = Math.min(ch.localBalanceSat, remaining);
        remaining -= deduct;
        return {
          ...ch,
          localBalanceSat: ch.localBalanceSat - deduct,
          remoteBalanceSat: ch.remoteBalanceSat + deduct,
        };
      });
      setChannels(updatedChannels);

      const txid = generateRandomHex(64);
      const newTx: TransactionItem = {
        id: `tx-${Date.now()}`,
        txid,
        type: 'lightning_out',
        amountSat,
        feeSat: 1,
        status: 'confirmed',
        timestamp: Date.now(),
        confirmations: 1,
        addressOrInvoice: recipient,
        label: label || 'Pagamento Lightning',
      };

      setTransactions((prev) => [newTx, ...prev]);
      return { success: true, txid };
    }

    // Onchain Bitcoin transaction
    if (!isValidBitcoinAddress(recipient)) {
      return { success: false, error: 'Endereço Bitcoin inválido. Verifique o formato bech32/legacy.' };
    }

    const totalNeeded = amountSat + feeSat;
    if (onchainBalanceSat < totalNeeded) {
      return {
        success: false,
        error: `Saldo on-chain insuficiente. Necessário: ${totalNeeded} sats, Disponível: ${onchainBalanceSat} sats.`,
      };
    }

    // Spend UTXOs
    let remainingToSpend = totalNeeded;
    const utxosToSpend: UTXO[] = [];
    const remainingUtxos: UTXO[] = [];

    // If specific coins were selected
    const available = utxos.filter((u) => !u.isFrozen);
    for (const u of available) {
      const key = `${u.txid}:${u.vout}`;
      if (selectedUtxoKeys && !selectedUtxoKeys.includes(key)) {
        remainingUtxos.push(u);
        continue;
      }
      if (remainingToSpend > 0) {
        utxosToSpend.push(u);
        remainingToSpend -= u.amountSat;
      } else {
        remainingUtxos.push(u);
      }
    }

    // Keep all frozen utxos too
    utxos.filter((u) => u.isFrozen).forEach((u) => remainingUtxos.push(u));

    // Handle change output if any
    const totalInput = utxosToSpend.reduce((sum, u) => sum + u.amountSat, 0);
    const changeSat = totalInput - totalNeeded;
    const newTxid = generateRandomHex(64);

    if (changeSat > 546) {
      // Create change UTXO
      const changeAddr = addresses.find((a) => a.type === 'change')?.address || generateBech32Address(99, true);
      remainingUtxos.push({
        txid: newTxid,
        vout: 1,
        address: changeAddr,
        amountSat: changeSat,
        confirmations: 0,
        blockHeight: activeServer.height,
        isFrozen: false,
        scriptType: 'p2wpkh',
      });
    }

    setUtxos(remainingUtxos);

    const newTx: TransactionItem = {
      id: `tx-${Date.now()}`,
      txid: newTxid,
      type: 'sent',
      amountSat,
      feeSat,
      status: 'unconfirmed',
      timestamp: Date.now(),
      confirmations: 0,
      addressOrInvoice: recipient,
      label: label || 'Pagamento On-Chain',
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, txid: newTxid };
  };

  const createReceiveRequest = (amountSat: number, memo: string, isLightning: boolean) => {
    if (isLightning) {
      const paymentHash = generateRandomHex(64);
      const bolt11 = `lnbc${amountSat}0n1p3x${generateRandomHex(80)}`;
      const expiresAt = Date.now() + 3600000; // 1 hour
      const newInvoice: LightningInvoice = {
        paymentHash,
        bolt11,
        amountSat,
        memo,
        createdAt: Date.now(),
        expiresAt,
        status: 'unpaid',
      };
      setInvoices((prev) => [newInvoice, ...prev]);
      return { addressOrInvoice: bolt11, expiresAt };
    }

    // Return next receiving address
    const unused = addresses.find((a) => a.type === 'receiving' && a.balanceSat === 0 && !a.frozen);
    const targetAddress = unused ? unused.address : generateBech32Address(addresses.length);
    return {
      addressOrInvoice: targetAddress,
      expiresAt: Date.now() + 86400000 * 3, // 3 days
    };
  };

  const toggleFreezeUtxo = (txid: string, vout: number) => {
    setUtxos((prev) =>
      prev.map((u) => (u.txid === txid && u.vout === vout ? { ...u, isFrozen: !u.isFrozen } : u))
    );
  };

  const toggleFreezeAddress = (address: string) => {
    setAddresses((prev) =>
      prev.map((a) => (a.address === address ? { ...a, frozen: !a.frozen } : a))
    );
  };

  const updateAddressLabel = (address: string, label: string) => {
    setAddresses((prev) =>
      prev.map((a) => (a.address === address ? { ...a, label } : a))
    );
  };

  const openLightningChannel = (peerAlias: string, peerPubkey: string, capacitySat: number) => {
    if (onchainBalanceSat < capacitySat + 1500) {
      return { success: false, error: 'Saldo on-chain insuficiente para financiar o canal.' };
    }

    // Deduct onchain funding
    let remaining = capacitySat + 1500;
    const newUtxos = utxos.filter((u) => {
      if (remaining <= 0) return true;
      if (u.amountSat <= remaining) {
        remaining -= u.amountSat;
        return false;
      }
      u.amountSat -= remaining;
      remaining = 0;
      return true;
    });
    setUtxos(newUtxos);

    const channelId = `chnl-${activeServer.height}x${Math.floor(Math.random() * 50)}x0`;
    const newChannel: LightningChannel = {
      id: channelId,
      peerAlias: peerAlias || 'Peer Remoto',
      peerPubkey,
      capacitySat,
      localBalanceSat: capacitySat - 2000,
      remoteBalanceSat: 0,
      status: 'open',
      feePpm: 200,
    };

    setChannels((prev) => [newChannel, ...prev]);
    return { success: true };
  };

  const closeLightningChannel = (channelId: string) => {
    const target = channels.find((c) => c.id === channelId);
    if (!target) return;

    // Refund local balance back to onchain
    if (target.localBalanceSat > 1000) {
      const refundUtxo: UTXO = {
        txid: generateRandomHex(64),
        vout: 0,
        address: addresses[0].address,
        amountSat: target.localBalanceSat - 1500, // closing fee
        confirmations: 1,
        blockHeight: activeServer.height,
        isFrozen: false,
        scriptType: 'p2wpkh',
      };
      setUtxos((prev) => [refundUtxo, ...prev]);
    }

    setChannels((prev) => prev.filter((c) => c.id !== channelId));
  };

  const signMessageWithKey = (message: string, address: string) => {
    // Generate deterministic signature simulation in standard Electrum base64 format
    const hash = Array.from(message + address).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return `H${btoa(hash.toString() + generateRandomHex(32)).slice(0, 87)}=`;
  };

  const verifySignedMessage = (message: string, address: string, signature: string) => {
    return (
      Boolean(message.trim()) &&
      isValidBitcoinAddress(address) &&
      signature.trim().length > 30
    );
  };

  const createNewWallet = (
    name: string,
    type: WalletType,
    seedWords?: string,
    passphrase?: string
  ) => {
    const seed = seedWords || generateMnemonic(12);
    const newDerivation = type === 'segwit_native' ? "m/84'/0'/0'" : "m/44'/0'/0'";
    const pubKey = type === 'segwit_native' ? `zpub6r${generateRandomHex(72)}` : `xpub66${generateRandomHex(72)}`;

    setWalletName(name.endsWith('.dat') ? name : `${name}.dat`);
    setWalletType(type);
    setKeystore({
      seedPhrase: seed,
      seedType: 'bip39',
      derivationPath: newDerivation,
      masterPublicKey: pubKey,
      masterPrivateKey: `zprv${generateRandomHex(72)}`,
      passphraseProtected: Boolean(passphrase),
      isEncrypted: false,
      fingerprint: generateRandomHex(8),
    });

    // Generate starter addresses
    const freshAddresses: AddressItem[] = Array.from({ length: 5 }, (_, i) => ({
      address: generateBech32Address(i),
      index: i,
      type: 'receiving',
      derivationPath: `${newDerivation}/0/${i}`,
      balanceSat: 0,
      txCount: 0,
      label: i === 0 ? 'Endereço principal' : `Recebimento #${i}`,
      frozen: false,
    }));

    setAddresses(freshAddresses);
    setUtxos([]);
    setTransactions([]);
    setChannels([]);
  };

  const switchElectrumServer = (host: string, port: number) => {
    setActiveServer({
      host,
      port,
      protocol: 'ssl',
      pingMs: Math.floor(Math.random() * 30 + 20),
      status: 'connected',
      height: 894142,
    });
  };

  return (
    <WalletContext.Provider
      value={{
        walletName,
        walletType,
        network,
        unit,
        fiat,
        lang,
        keystore,
        addresses,
        utxos,
        transactions,
        channels,
        invoices,
        activeServer,
        feeRates,
        torEnabled,
        isLocked,
        onchainBalanceSat,
        unconfirmedBalanceSat,
        lightningBalanceSat,
        totalBalanceSat,
        setUnit,
        setFiat,
        setLang,
        setNetwork,
        setTorEnabled,
        toggleLock,
        sendTransaction,
        createReceiveRequest,
        toggleFreezeUtxo,
        toggleFreezeAddress,
        updateAddressLabel,
        openLightningChannel,
        closeLightningChannel,
        signMessageWithKey,
        verifySignedMessage,
        createNewWallet,
        switchElectrumServer,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
