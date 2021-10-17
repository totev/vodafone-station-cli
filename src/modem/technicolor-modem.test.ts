import {normalizeChannelStatus} from './technicolor-modem'

test('should work with ofdm in download', () => {
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
