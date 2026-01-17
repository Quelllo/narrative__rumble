#!/usr/bin/env node

/**
 * Pear Protocol EIP-712 Authentication Setup Script
 *
 * This script authenticates with Pear Protocol using an EIP-712 signature
 * and prints out an accessToken and refreshToken you can put in .env.
 *
 * Required environment variables:
 * - PEAR_API_BASE: Base URL for Pear API (e.g. https://hl-v2.pearprotocol.io)
 * - PEAR_CLIENT_ID: Your Pear client ID (e.g. HLHackathon1)
 * - PEAR_USER_ADDRESS: Ethereum address of the user
 * - PEAR_USER_PRIVATE_KEY: Private key for signing (0x-prefixed or not)
 *
 * Usage:
 *   npx ts-node scripts/pear-auth-setup.ts
 */

import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

interface EIP712MessageResponse {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: {
    EIP712Domain: Array<{ name: string; type: string }>;
    [key: string]: Array<{ name: string; type: string }>;
  };
  message: Record<string, unknown>;
  primaryType: string;
}

interface LoginRequest {
  method: "eip712";
  address: string;
  clientId: string;
  details: {
    signature: string;
  };
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  [key: string]: unknown;
}

async function main() {
  const apiBase = process.env.PEAR_API_BASE;
  const clientId = process.env.PEAR_CLIENT_ID;
  const userAddress = process.env.PEAR_USER_ADDRESS;
  const privateKey = process.env.PEAR_USER_PRIVATE_KEY;

  if (!apiBase || !clientId || !userAddress || !privateKey) {
    console.error("Missing required environment variables:");
    console.error("  PEAR_API_BASE:", apiBase ? "✓" : "✗");
    console.error("  PEAR_CLIENT_ID:", clientId ? "✓" : "✗");
    console.error("  PEAR_USER_ADDRESS:", userAddress ? "✓" : "✗");
    console.error("  PEAR_USER_PRIVATE_KEY:", privateKey ? "✓" : "✗");
    process.exit(1);
  }

  try {
    console.log("Step 1: Fetching EIP-712 message...");
    const messageUrl = `${apiBase}/auth/eip712-message?address=${encodeURIComponent(
      userAddress
    )}&clientId=${encodeURIComponent(clientId)}`;

    const messageResponse = await fetch(messageUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      throw new Error(
        `Failed to get EIP712 message: ${messageResponse.status} - ${errorText}`
      );
    }

    const eip712Data = (await messageResponse.json()) as EIP712MessageResponse;
    console.log("✓ Received EIP-712 message");

    console.log("Step 2: Signing EIP-712 message...");
    const pkWithPrefix = privateKey.startsWith("0x")
      ? privateKey
      : `0x${privateKey}`;
    const wallet = new ethers.Wallet(pkWithPrefix);

    if (wallet.address.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error(
        `Address mismatch: wallet ${wallet.address} != PEAR_USER_ADDRESS ${userAddress}`
      );
    }

    const signature = await wallet.signTypedData(
      eip712Data.domain,
      eip712Data.types,
      eip712Data.message
    );

    console.log("✓ Message signed");

    console.log("Step 3: Authenticating with Pear API...");
    const loginRequest: LoginRequest = {
      method: "eip712",
      address: userAddress,
      clientId: clientId,
      details: { signature },
    };

    const loginResponse = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(loginRequest),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(
        `Authentication failed: ${loginResponse.status} - ${errorText}`
      );
    }

    const loginData = (await loginResponse.json()) as LoginResponse;
    console.log("✓ Authentication successful\n");

    console.log("=== Authentication Tokens ===");
    console.log("Access Token:", loginData.accessToken);
    console.log("Refresh Token:", loginData.refreshToken);
    if (loginData.expiresIn) {
      console.log("Expires In:", loginData.expiresIn, "seconds");
      const expiryDate = new Date(Date.now() + loginData.expiresIn * 1000);
      console.log("Expires At:", expiryDate.toISOString());
    }
    console.log("=============================\n");
    console.log(
      "Paste these into your .env as PEAR_ACCESS_TOKEN and PEAR_REFRESH_TOKEN."
    );
  } catch (err) {
    console.error(
      "\n✗ Error:",
      err instanceof Error ? err.message : String(err)
    );
    process.exit(1);
  }
}

main();
