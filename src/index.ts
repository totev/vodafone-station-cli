#!/usr/bin/env node
import {promises as fsp} from 'fs'
import {fetchDocsisStatus, login, logout, restart} from './client'

export async function printDocsisStatus(password: string) {
  try {
    const csrfNonce = await login(password)
    const docsisStatus = await fetchDocsisStatus(csrfNonce)
    const docsisStatusJSON = JSON.stringify(docsisStatus, undefined, 4)
    console.log('Docsis status: ', docsisStatusJSON)
    const reportFile = `reports/${Date.now()}_doscsisReport.json`
    console.log('Writing docsis report as json to file: ', reportFile)
    const data = new Uint8Array(Buffer.from(docsisStatusJSON))
    await fsp.writeFile(reportFile, data)
  } catch (error) {
    console.error('Something went wrong.', error)
  } finally {
    await logout()
  }
}

export async function restartRouter(password: string) {
  try {
    const csrfNonce = await login(password)
    await restart(csrfNonce)
  } catch (error) {
    console.error('Something went wrong.', error)
  } finally {
    await logout()
  }
}
