import fixtureDocsis31Status from './__fixtures__/docsisStatus_ofdma_technicolor.json'
import fixtureDocsisStatus from './__fixtures__/docsisStatus_technicolor.json'
import { normalizeChannelStatus, normalizeDocsisStatus, normalizeOfdmChannelStatus, normalizeUpstreamChannelStatus, normalizeUpstreamOfdmaChannelStatus, TechnicolorDocsisStatus } from './technicolor-modem'


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
      modulation: '256QAM',
      powerLevel: -4,
      lockStatus: 'Locked',
      snr: 38.8,
      frequency: 602
    },
  )
})

test('normalizeOfdmChannelStatus with OFDM channel', () => {
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
      modulation: '256QAM',
      powerLevel: -3.2,
      lockStatus: 'Locked',
      snr: 39.55,
      frequencyStart: 151,
      frequencyEnd: 324
    }
  )
})

test('normalizeUpstreamChannelStatus', () => {
  const nativeStatus =             {
    __id: '1',
    channelidup: '1',
    CentralFrequency: '51.0 MHz',
    power: '49.8 dBmV',
    ChannelType: 'SC-QAM',
    FFT: '64qam',
    RangingStatus: 'Completed'
  } as const
  expect(normalizeUpstreamChannelStatus(nativeStatus)).toEqual(
    {
      channelId: '1',
      channelType: 'SC-QAM',
      frequency: 51,
      lockStatus: 'Completed',
      modulation: '64QAM',
      powerLevel: 49.8,
      snr: 0,
    },
  )
})

test('normalizeUpstreamOfdmaChannelStatus', () => {
  const nativeStatus =            {
    __id: '1',
    channelidup: '9',
    start_frequency: '29.800000 MHz',
    end_frequency: '64.750000 MHz',
    power: '44.0 dBmV',
    CentralFrequency: '46 MHz',
    bandwidth: '35 MHz',
    FFT: 'qpsk',
    ChannelType: 'OFDMA',
    RangingStatus: 'Completed'
  } as const
  expect(normalizeUpstreamOfdmaChannelStatus(nativeStatus)).toEqual(
    {
      channelId: '9',
      channelType: 'OFDMA',
      frequencyEnd: 64.75,
      frequencyStart: 29.8,
      lockStatus: 'Completed',
      modulation: 'QPSK',
      powerLevel: 44,
      snr: 0,
    },
  )
})

describe('normalizeDocsisStatus', () => {
  test('should work with ofdm in download', () => {
    const {time, ...status} = normalizeDocsisStatus(fixtureDocsisStatus as TechnicolorDocsisStatus)
    expect(status).toMatchSnapshot()
  })
  test('should work with ofdm in download and ofdam in upload', () => {
    const {time, ...status} = normalizeDocsisStatus(fixtureDocsis31Status as TechnicolorDocsisStatus)
    expect(status).toMatchSnapshot()
  })
})
