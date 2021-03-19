import axios from 'axios'
const BRIDGED_MODEM_IP = '192.168.100.1'
const ROUTER_IP = '192.168.0.1'

export async function discoverModemIp(): Promise<string> {
  try {
    const result = await Promise.any([axios.head(`http://${BRIDGED_MODEM_IP}`), axios.head(`http://${ROUTER_IP}`)])
    const hostIp = result.request?.host
    return hostIp
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Could not find a router/modem under the known addresses', error)
    throw error
  }
}
