import express from "express";
import { mnemonicToWalletKey } from "@ton/crypto";
import { TonClient, WalletContractV4, internal, toNano, fromNano, comment } from "@ton/ton";
import { Address } from "@ton/core";
import archiver from "archiver";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;

const MAINNET_RPC = "https://toncenter.com/api/v2/jsonRPC";
const TESTNET_RPC = "https://testnet.toncenter.com/api/v2/jsonRPC";

app.use(express.json());
app.use(express.static("public"));

app.get("/api/settings", (req, res) => {
  res.json({
    hasWallet: !!process.env.WALLET_MNEMONIC,
    network: process.env.NETWORK || "testnet",
    hasApiKey: !!process.env.TONCENTER_API_KEY,
    recipientAddress: process.env.RECIPIENT_ADDRESS || "",
  });
});

app.get("/api/balance", async (req, res) => {
  try {
    if (!process.env.WALLET_MNEMONIC) {
      return res.status(400).json({ error: "يرجى إضافة WALLET_MNEMONIC في Secrets" });
    }

    const mnemonicArray = process.env.WALLET_MNEMONIC.split(/\s+/);
    const keyPair = await mnemonicToWalletKey(mnemonicArray);

    const network = process.env.NETWORK || "testnet";
    const endpoint = network === "mainnet" ? MAINNET_RPC : TESTNET_RPC;
    const client = new TonClient({
      endpoint: endpoint,
      apiKey: process.env.TONCENTER_API_KEY || undefined,
    });

    const wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: keyPair.publicKey,
    });

    const contract = client.open(wallet);
    const balance = await contract.getBalance();
    const balanceInTON = fromNano(balance);

    res.json({
      balance: balanceInTON,
      address: wallet.address.toString(),
      network: network,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/withdraw", async (req, res) => {
  try {
    const { recipientAddress, amount, transferComment } = req.body;

    if (!process.env.WALLET_MNEMONIC) {
      return res.status(400).json({ error: "يرجى إضافة WALLET_MNEMONIC في Secrets" });
    }

    if (!recipientAddress) {
      return res.status(400).json({ error: "يرجى إدخال عنوان المحفظة المستقبلة" });
    }

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "يرجى إدخال مبلغ صحيح" });
    }

    try {
      Address.parse(recipientAddress);
    } catch (error) {
      return res.status(400).json({ error: "عنوان المحفظة المستقبلة غير صالح" });
    }

    const mnemonicArray = process.env.WALLET_MNEMONIC.split(/\s+/);
    const keyPair = await mnemonicToWalletKey(mnemonicArray);

    const network = process.env.NETWORK || "testnet";
    const endpoint = network === "mainnet" ? MAINNET_RPC : TESTNET_RPC;
    const client = new TonClient({
      endpoint: endpoint,
      apiKey: process.env.TONCENTER_API_KEY || undefined,
    });

    const wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: keyPair.publicKey,
    });

    const contract = client.open(wallet);
    const balance = await contract.getBalance();
    const balanceInTON = fromNano(balance);

    if (parseFloat(balanceInTON) < parseFloat(amount)) {
      return res.status(400).json({
        error: `رصيد غير كافٍ! الرصيد: ${balanceInTON} TON، المطلوب: ${amount} TON`,
      });
    }

    const seqno = await contract.getSeqno();
    const amountInNano = toNano(amount);

    await contract.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [
        internal({
          to: recipientAddress,
          value: amountInNano,
          body: transferComment ? comment(transferComment) : undefined,
          bounce: false,
        }),
      ],
    });

    const explorerUrl =
      network === "mainnet"
        ? `https://tonviewer.com/${wallet.address.toString()}`
        : `https://testnet.tonviewer.com/${wallet.address.toString()}`;

    res.json({
      success: true,
      message: "تم إرسال المعاملة بنجاح",
      seqno: seqno,
      amount: amount,
      recipient: recipientAddress,
      explorerUrl: explorerUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/download-project", (req, res) => {
  const archive = archiver("zip", {
    zlib: { level: 9 }
  });

  res.attachment("ton-withdraw-app.zip");
  
  archive.on("error", (err) => {
    res.status(500).send({ error: err.message });
  });

  archive.pipe(res);

  const filesToInclude = [
    "server.js",
    "index.js",
    "package.json",
    "package-lock.json",
    "README.md",
    "replit.md",
    ".gitignore",
    ".env.example"
  ];

  filesToInclude.forEach(file => {
    if (fs.existsSync(file)) {
      archive.file(file, { name: file });
    }
  });

  if (fs.existsSync("public")) {
    archive.directory("public/", "public");
  }

  archive.finalize();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 تطبيق TON يعمل على http://0.0.0.0:${PORT}`);
});
