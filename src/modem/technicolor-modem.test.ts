
import {normalizeChannelStatus, normalizeOfdmChannelStatus} from './technicolor-modem'

test('normalizeChannelStatus with SC-QAM channel', () => {
  const nativeStatus =
    {
      __id: '1',
      channelid: '5',
      CentralFrequency: '602 MHz',
      power: '-4.0 dBmV',
      SNR: '38.8 dB',
      FFT: '256 QAM',
      locked: 'Locked',
      ChannelType: 'SC-QAM'
    } as const
  const status = normalizeChannelStatus(nativeStatus)
  expect(status).toEqual(
    {
      channelId: '5',
      channelType: 'SC-QAM',
      modulation: '256 QAM',
      powerLevel: -4,
      lockStatus: 'Locked',
      snr: 38.8,
      frequency: 602
    },
  )
})

test('normalizeOfdmChannelStatus with OFDM channel', () => {
  /* eslint-disable @typescript-eslint/camelcase */
  const nativeStatus =
    {
      __id: '1',
      channelid_ofdm: '33',
      start_frequency: '151 MHz',
      end_frequency: '324 MHz',
      CentralFrequency_ofdm: '288 MHz',
      bandwidth: '171 MHz',
      power_ofdm: '-3.2 dBmV',
      SNR_ofdm: '39.55 dB',
      FFT_ofdm: 'qam256/qam1024',
      locked_ofdm: 'Locked',
      ChannelType: 'OFDM'
    } as const
  const status = normalizeOfdmChannelStatus(nativeStatus)
  expect(status).toEqual(
    {
      channelId: '33',
      channelType: 'OFDM',
      modulation: 'qam256/qam1024',
      powerLevel: -3.2,
      lockStatus: 'Locked',
      snr: 39.55,
      frequencyStart: 151,
      frequencyEnd: 324
    }
  )
})
