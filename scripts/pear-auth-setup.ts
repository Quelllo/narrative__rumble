#!/usr/bin/env node

import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// ANSI color codes for better visibility
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

interface EIP712Data {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: Record<string, Array<{ name: string; type: string }>>;
  message: Record<string, unknown>;
  primaryType: string;
}

async function main() {
  const apiBase = process.env.PEAR_API_BASE!;
  const clientId = process.env.PEAR_CLIENT_ID!;
  const userAddress = process.env.PEAR_USER_ADDRESS!;
  const privateKey = process.env.PEAR_USER_PRIVATE_KEY!;

  if (!apiBase || !clientId || !userAddress || !privateKey) {
    console.error(`${colors.red}${colors.bright}✗ Missing env vars${colors.reset}`);
    process.exit(1);
  }

  const pk = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  const wallet = new ethers.Wallet(pk);

  if (wallet.address.toLowerCase() !== userAddress.toLowerCase()) {
    console.error(`${colors.red}${colors.bright}✗ Address/key mismatch${colors.reset}`);
    process.exit(1);
  }

  // Step 1: Get EIP-712 message
  console.log(`${colors.cyan}${colors.bright}Fetching EIP-712 message...${colors.reset}`);
  console.log(`${colors.blue}  API Base: ${apiBase}${colors.reset}`);
  // Ensure API base doesn't have trailing slash
  const baseUrl = apiBase.replace(/\/$/, '');
  
  // First, check if base URL is reachable
  try {
    const healthCheck = await fetch(baseUrl, { method: 'GET' });
    console.log(`${colors.blue}  Base URL status: ${healthCheck.status}${colors.reset}`);
  } catch (e) {
    console.log(`${colors.yellow}  ⚠️  Base URL check failed: ${e instanceof Error ? e.message : String(e)}${colors.reset}`);
  }
  
  // Try different possible endpoint paths and methods
  const attempts = [
    // GET with query params - various paths
    { method: 'GET', url: `${baseUrl}/auth/eip712-message?address=${encodeURIComponent(userAddress)}&clientId=${encodeURIComponent(clientId)}`, body: null },
    { method: 'GET', url: `${baseUrl}/auth/message?address=${encodeURIComponent(userAddress)}&clientId=${encodeURIComponent(clientId)}`, body: null },
    { method: 'GET', url: `${baseUrl}/v1/auth/eip712-message?address=${encodeURIComponent(userAddress)}&clientId=${encodeURIComponent(clientId)}`, body: null },
    { method: 'GET', url: `${baseUrl}/v2/auth/eip712-message?address=${encodeURIComponent(userAddress)}&clientId=${encodeURIComponent(clientId)}`, body: null },
    { method: 'GET', url: `${baseUrl}/api/auth/eip712-message?address=${encodeURIComponent(userAddress)}&clientId=${encodeURIComponent(clientId)}`, body: null },
    // POST with body
    { method: 'POST', url: `${baseUrl}/auth/eip712-message`, body: { address: userAddress, clientId } },
    { method: 'POST', url: `${baseUrl}/auth/message`, body: { address: userAddress, clientId } },
    { method: 'POST', url: `${baseUrl}/v1/auth/eip712-message`, body: { address: userAddress, clientId } },
    { method: 'POST', url: `${baseUrl}/v2/auth/eip712-message`, body: { address: userAddress, clientId } },
    { method: 'POST', url: `${baseUrl}/api/auth/eip712-message`, body: { address: userAddress, clientId } },
  ];
  
  let messageRes: Response | null = null;
  let lastError: string = '';
  
  for (const attempt of attempts) {
    console.log(`${colors.blue}  Trying ${attempt.method} ${attempt.url}${colors.reset}`);
    
    const fetchOptions: RequestInit = {
      method: attempt.method,
      headers: { Accept: "application/json" },
    };
    
    if (attempt.body) {
      fetchOptions.headers = { ...fetchOptions.headers, 'Content-Type': 'application/json' };
      fetchOptions.body = JSON.stringify(attempt.body);
    }
    
    messageRes = await fetch(attempt.url, fetchOptions);
    
    if (messageRes.ok) {
      console.log(`${colors.green}${colors.bright}  ✓ Found endpoint: ${attempt.method} ${attempt.url}${colors.reset}`);
      break;
    } else {
      lastError = await messageRes.text();
      console.log(`${colors.yellow}  ✗ ${messageRes.status}: ${lastError.substring(0, 100)}${colors.reset}`);
    }
  }

  if (!messageRes || !messageRes.ok) {
    throw new Error(`EIP712 message failed. Last error (${messageRes?.status || 'unknown'}): ${lastError}`);
  }

  const eip712 = (await messageRes.json()) as EIP712Data;
  console.log(`${colors.green}${colors.bright}✓ EIP-712 message received${colors.reset}`);
  
  // Log the message structure to verify timestamp exists
  console.log(`${colors.cyan}  EIP-712 message structure:${colors.reset}`);
  console.log(`${colors.white}${JSON.stringify(eip712.message, null, 2)}${colors.reset}`);
  
  // Verify timestamp exists
  if (!eip712.message.timestamp) {
    console.error(`${colors.red}${colors.bright}  ⚠️  WARNING: timestamp field not found in eip712.message${colors.reset}`);
    console.error(`${colors.yellow}  Available fields: ${Object.keys(eip712.message).join(', ')}${colors.reset}`);
  } else {
    console.log(`${colors.green}  Timestamp: ${eip712.message.timestamp}${colors.reset}`);
  }

  // Step 2: Sign immediately
  console.log(`${colors.cyan}${colors.bright}Signing...${colors.reset}`);
  const signature = await wallet.signTypedData(
    eip712.domain,
    eip712.types,
    eip712.message
  );
  console.log(`${colors.green}${colors.bright}✓ Signed${colors.reset}`);

  // Step 3: Login immediately (minimize timestamp drift)
  // Include timestamp in details as required by Pear API
  console.log(`${colors.cyan}${colors.bright}Authenticating...${colors.reset}`);
  const loginRequest = {
    method: "eip712",
    address: userAddress,
    clientId,
    details: {
      signature,
      timestamp: eip712.message.timestamp,
    },
  };
  
  // Log the request body before sending
  console.log(`${colors.cyan}  Login request body:${colors.reset}`);
  console.log(`${colors.white}${JSON.stringify(loginRequest, null, 2)}${colors.reset}`);
  
  const loginRes = await fetch(`${apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginRequest),
  });

  if (!loginRes.ok) {
    const err = await loginRes.text();
    throw new Error(`Login failed: ${loginRes.status} - ${err}`);
  }

  const tokens: any = await loginRes.json();
  console.log(`\n${colors.green}${colors.bright}${colors.bgBlack}=== TOKENS ===${colors.reset}`);
  console.log(`${colors.green}${colors.bright}PEAR_ACCESS_TOKEN:${colors.reset} ${colors.white}${tokens.accessToken}${colors.reset}`);
  console.log(`${colors.green}${colors.bright}PEAR_REFRESH_TOKEN:${colors.reset} ${colors.white}${tokens.refreshToken}${colors.reset}`);
  console.log(`${colors.green}${colors.bright}${colors.bgBlack}===============${colors.reset}\n`);
  console.log(`${colors.cyan}${colors.bright}Copy these to .env and restart backend.${colors.reset}`);
}

main().catch(console.error);
