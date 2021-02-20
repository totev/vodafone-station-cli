#!/usr/bin/env node
import { fetchDocsisStatus, login, logout } from "./client";
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

if (!argv.password) {
  console.log("No password given! Use with --password");
} else {
  printDocsisStatus(argv.password);
}

export async function printDocsisStatus(password: string) {
  try {
    const csrfNonce = await login(password);
    const docsisStatus = await fetchDocsisStatus(csrfNonce);
    console.log("Docsis status: ", JSON.stringify(docsisStatus));
  } catch (error) {
    console.error("Something went wrong.", error);
  } finally {
    await logout();
  }
}
