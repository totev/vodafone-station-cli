export interface HumanizedDocsisStatus {
  channelId: string;
  channelType: string;
  frequency: number; // MHz
  snr: number; // dB
  modulation: string;
  lockStatus: string;
  powerLevel: number; // dBmV
}
/*
        {
            "ChannelType": "OFDM",
            "Modulation": "1024QAM",
            "Frequency": "151~324",
            "ChannelID": "33",
            "PowerLevel": "-4.1/55.9",
            "SNRLevel": "39",
            "LockStatus": "Locked"
        },

        "ofdm_downstream": [
            {
                "__id": "1",
                "channelid_ofdm": "33",
                "start_frequency": "151 MHz",
                "end_frequency": "324 MHz",
                "CentralFrequency_ofdm": "288 MHz",
                "bandwidth": "171 MHz",
                "power_ofdm": "-3.0 dBmV",
                "SNR_ofdm": "39.55 dB",
                "FFT_ofdm": "qam256/qam1024",
                "locked_ofdm": "Locked",
                "ChannelType": "OFDM"
            }
        ],

*/
