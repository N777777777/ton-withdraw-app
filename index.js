import { mnemonicToWalletKey } from "@ton/crypto";
import { TonClient, WalletContractV4, internal, toNano, fromNano, comment } from "@ton/ton";
import { Address } from "@ton/core";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const MAINNET_RPC = "https://toncenter.com/api/v2/jsonRPC";
const TESTNET_RPC = "https://testnet.toncenter.com/api/v2/jsonRPC";

async function main() {
  console.log(chalk.cyan.bold("\n🚀 سكربت سحب TON التلقائي\n"));

  const mnemonic = process.env.WALLET_MNEMONIC;
  const recipientAddress = process.env.RECIPIENT_ADDRESS;
  const amount = process.env.AMOUNT || "0.1";
  const transferComment = process.env.TRANSFER_COMMENT || "";
  const network = process.env.NETWORK || "testnet";
  const apiKey = process.env.TONCENTER_API_KEY;

  if (!mnemonic) {
    console.log(chalk.red("❌ خطأ: يرجى إضافة WALLET_MNEMONIC في ملف .env"));
    console.log(chalk.yellow("💡 انسخ ملف .env.example إلى .env وأضف كلمات محفظتك"));
    process.exit(1);
  }

  if (!recipientAddress) {
    console.log(chalk.red("❌ خطأ: يرجى إضافة RECIPIENT_ADDRESS في ملف .env"));
    process.exit(1);
  }

  const mnemonicArray = mnemonic.trim().split(/\s+/);
  if (mnemonicArray.length !== 24) {
    console.log(chalk.red(`❌ خطأ: يجب أن تكون كلمات المحفظة 24 كلمة (وجدت ${mnemonicArray.length} كلمة)`));
    process.exit(1);
  }

  try {
    Address.parse(recipientAddress);
  } catch (error) {
    console.log(chalk.red("❌ خطأ: عنوان المحفظة المستقبلة غير صالح"));
    process.exit(1);
  }

  const endpoint = network === "mainnet" ? MAINNET_RPC : TESTNET_RPC;
  console.log(chalk.blue(`🌐 الشبكة: ${network.toUpperCase()}`));
  console.log(chalk.gray(`📡 RPC: ${endpoint}\n`));

  console.log(chalk.yellow("🔑 جاري تحميل المحفظة..."));

  const keyPair = await mnemonicToWalletKey(mnemonicArray);

  const client = new TonClient({
    endpoint: endpoint,
    apiKey: apiKey || undefined,
  });

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });

  const contract = client.open(wallet);
  const walletAddress = wallet.address.toString();

  console.log(chalk.green(`✅ عنوان المحفظة: ${walletAddress}\n`));

  console.log(chalk.yellow("💰 جاري جلب الرصيد..."));

  const balance = await contract.getBalance();
  const balanceInTON = fromNano(balance);

  console.log(chalk.green(`💎 الرصيد الحالي: ${balanceInTON} TON\n`));

  if (parseFloat(balanceInTON) < parseFloat(amount)) {
    console.log(chalk.red(`❌ رصيد غير كافٍ! الرصيد: ${balanceInTON} TON، المطلوب: ${amount} TON`));
    process.exit(1);
  }

  const amountInNano = toNano(amount);
  console.log(chalk.cyan("📤 تفاصيل التحويل:"));
  console.log(chalk.white(`   المبلغ: ${amount} TON`));
  console.log(chalk.white(`   إلى: ${recipientAddress}`));
  if (transferComment) {
    console.log(chalk.white(`   الرسالة: ${transferComment}`));
  }
  console.log();

  console.log(chalk.yellow("⏳ جاري إرسال المعاملة..."));

  try {
    const seqno = await contract.getSeqno();

    let retries = 3;
    let success = false;
    let lastError = null;

    for (let i = 0; i < retries; i++) {
      try {
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
        success = true;
        break;
      } catch (err) {
        lastError = err;
        if (i < retries - 1) {
          console.log(chalk.yellow(`   ⏳ محاولة ${i + 2}/${retries}...`));
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!success) {
      throw lastError;
    }

    console.log(chalk.green.bold("\n✅ تم إرسال المعاملة بنجاح!\n"));
    console.log(chalk.cyan("📋 معلومات المعاملة:"));
    console.log(chalk.white(`   Sequence Number: ${seqno}`));
    console.log(chalk.white(`   المبلغ المرسل: ${amount} TON`));
    console.log(chalk.white(`   المحفظة المستقبلة: ${recipientAddress}`));

    console.log(chalk.yellow("\n⏱️  انتظر حوالي 5 ثوانٍ لتأكيد المعاملة على الشبكة...\n"));

    await new Promise((resolve) => setTimeout(resolve, 6000));

    const newBalance = await contract.getBalance();
    const newBalanceInTON = fromNano(newBalance);

    console.log(chalk.green(`💎 الرصيد الجديد: ${newBalanceInTON} TON`));
    console.log(
      chalk.gray(`   (تم خصم ${(parseFloat(balanceInTON) - parseFloat(newBalanceInTON)).toFixed(4)} TON شامل رسوم الشبكة)`)
    );

    const explorerUrl =
      network === "mainnet"
        ? `https://tonviewer.com/${walletAddress}`
        : `https://testnet.tonviewer.com/${walletAddress}`;

    console.log(chalk.blue(`\n🔍 يمكنك مشاهدة المعاملة على: ${explorerUrl}\n`));
    console.log(chalk.green.bold("✨ تمت العملية بنجاح!\n"));
  } catch (error) {
    console.log(chalk.red.bold("\n❌ حدث خطأ أثناء إرسال المعاملة:\n"));
    console.log(chalk.red(error.message));

    if (error.message.includes("insufficient funds")) {
      console.log(chalk.yellow("\n💡 تأكد من وجود رصيد كافٍ لتغطية المبلغ + رسوم الشبكة (~0.01 TON)"));
    }
  }
}

main().catch((error) => {
  console.log(chalk.red.bold("\n❌ حدث خطأ غير متوقع:\n"));
  console.log(chalk.red(error.message));
  console.log(chalk.gray(error.stack));
  process.exit(1);
});
