import axios from 'axios';
import { discoverModemLocation, ModemDiscovery } from './discovery';
import { extractFirmwareVersion } from './tools/html-parser';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock html-parser
jest.mock('./tools/html-parser');
const mockedExtractFirmwareVersion = extractFirmwareVersion as jest.MockedFunction<typeof extractFirmwareVersion>;

describe('Discovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.VODAFONE_ROUTER_IP;
  });

  describe('discoverModemLocation', () => {
    describe('with IP parameter', () => {
      it('should use provided IP address and return modem location', async () => {
        const mockResponse = {
          status: 200,
          request: { 
            host: '192.168.1.100',
            protocol: 'http:' 
          }
        };
        mockedAxios.head = jest.fn().mockResolvedValue(mockResponse);

        const result = await discoverModemLocation({ ip: '192.168.1.100' });

        expect(mockedAxios.head).toHaveBeenCalledWith('http://192.168.1.100');
        expect(result).toEqual({
          ipAddress: '192.168.1.100',
          protocol: 'http',
        });
      });

      it('should try both HTTP and HTTPS for provided IP', async () => {
        const mockResponse = {
          status: 200,
          request: { 
            host: '192.168.1.100',
            protocol: 'https:' 
          }
        };
        mockedAxios.head = jest.fn()
          .mockRejectedValueOnce(new Error('HTTP failed'))
          .mockResolvedValueOnce(mockResponse);

        const result = await discoverModemLocation({ ip: '192.168.1.100' });

        expect(mockedAxios.head).toHaveBeenCalledTimes(2);
        expect(mockedAxios.head).toHaveBeenNthCalledWith(1, 'http://192.168.1.100');
        expect(mockedAxios.head).toHaveBeenNthCalledWith(2, 'https://192.168.1.100');
        expect(result).toEqual({
          ipAddress: '192.168.1.100',
          protocol: 'https',
        });
      });

      it('should throw error if both HTTP and HTTPS fail with provided IP', async () => {
        mockedAxios.head = jest.fn().mockRejectedValue(new Error('Connection failed'));

        await expect(discoverModemLocation({ ip: '192.168.1.100' }))
          .rejects.toThrow('Could not find a router/modem under the known addresses.');
      });
    });

    describe('without IP parameter (default behavior)', () => {
      it('should try default IPs when no IP provided', async () => {
        const mockResponse = {
          status: 200,
          request: { 
            host: '192.168.100.1',
            protocol: 'http:' 
          }
        };
        mockedAxios.head = jest.fn().mockResolvedValue(mockResponse);

        const result = await discoverModemLocation();

        // Should try first default IP
        expect(mockedAxios.head).toHaveBeenCalledWith('http://192.168.100.1');
        expect(result.ipAddress).toBe('192.168.100.1');
      });

      it('should try multiple default IPs if first fails', async () => {
         const mockResponse = {
           status: 200,
           request: { 
             host: '192.168.0.1',
             protocol: 'https:' 
           }
         };

         mockedAxios.head = jest.fn()
           .mockRejectedValueOnce(new Error('Failed'))  // 192.168.100.1 HTTP
           .mockRejectedValueOnce(new Error('Failed'))  // 192.168.100.1 HTTPS
           .mockRejectedValueOnce(new Error('Failed'))  // 192.168.0.1 HTTP
           .mockResolvedValueOnce(mockResponse);        // 192.168.0.1 HTTPS

         const result = await discoverModemLocation();

         expect(mockedAxios.head).toHaveBeenCalledTimes(4);
         expect(mockedAxios.head).toHaveBeenNthCalledWith(1, 'http://192.168.100.1');
         expect(mockedAxios.head).toHaveBeenNthCalledWith(2, 'https://192.168.100.1');
         expect(mockedAxios.head).toHaveBeenNthCalledWith(3, 'http://192.168.0.1');
         expect(mockedAxios.head).toHaveBeenNthCalledWith(4, 'https://192.168.0.1');
         expect(result.ipAddress).toBe('192.168.0.1');
         expect(result.protocol).toBe('https');
       });
    });

    describe('protocol detection', () => {
      it('should correctly extract protocol without colon', async () => {
        const mockResponse = {
          status: 200,
          request: { 
            host: '192.168.1.100',
            protocol: 'https:' // Protocol with colon as returned by axios
          }
        };
        mockedAxios.head = jest.fn().mockResolvedValue(mockResponse);

        const result = await discoverModemLocation({ ip: '192.168.1.100' });

        expect(result.protocol).toBe('https'); // Should be without colon
      });
    });
  });

  describe('ModemDiscovery', () => {
    const mockLogger = {
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const mockModemLocation = {
      ipAddress: '192.168.1.1',
      protocol: 'http' as const,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('discover', () => {
      it('should successfully discover Technicolor modem', async () => {
        const mockTechnicolorResponse = {
          data: {
            error: 'ok',
            data: {
              firmwareversion: '20.3.c.0317',
            },
          },
        };
        mockedAxios.get = jest.fn()
          .mockRejectedValueOnce(new Error('Arris failed')) // tryArris fails
          .mockResolvedValueOnce(mockTechnicolorResponse);   // tryTechnicolor succeeds

        const discovery = new ModemDiscovery(mockModemLocation, mockLogger as any);
        const result = await discovery.discover();

        expect(result).toEqual({
          deviceType: 'Technicolor',
          firmwareVersion: '20.3.c.0317',
          ipAddress: '192.168.1.1',
          protocol: 'http',
        });
      });

      it('should successfully discover Arris modem', async () => {
        const mockArrisResponse = {
          data: '<html>some firmware version data</html>',
        };

        mockedExtractFirmwareVersion.mockReturnValue('AR01.03.045.12_042321_711.PC20.1');

        mockedAxios.get = jest.fn()
          .mockResolvedValueOnce(mockArrisResponse)         // tryArris succeeds
          .mockRejectedValueOnce(new Error('Technicolor failed')); // tryTechnicolor fails

        const discovery = new ModemDiscovery(mockModemLocation, mockLogger as any);
        const result = await discovery.discover();

        expect(result).toEqual({
          deviceType: 'Arris',
          firmwareVersion: 'AR01.03.045.12_042321_711.PC20.1',
          ipAddress: '192.168.1.1',
          protocol: 'http',
        });
      });

      it('should throw error when both modem types fail', async () => {
        mockedAxios.get = jest.fn().mockRejectedValue(new Error('Connection failed'));

        const discovery = new ModemDiscovery(mockModemLocation, mockLogger as any);
        
        await expect(discovery.discover()).rejects.toThrow();
      });
    });

    describe('tryTechnicolor', () => {
      it('should make correct API call for Technicolor', async () => {
        const mockResponse = {
          data: {
            error: 'ok',
            data: {
              firmwareversion: '20.3.c.0317',
            },
          },
        };
        mockedAxios.get = jest.fn().mockResolvedValue(mockResponse);

        const discovery = new ModemDiscovery(mockModemLocation, mockLogger as any);
        const result = await discovery.tryTechnicolor();

        expect(mockedAxios.get).toHaveBeenCalledWith('http://192.168.1.1/api/v1/login_conf');
        expect(result.deviceType).toBe('Technicolor');
        expect(result.firmwareVersion).toBe('20.3.c.0317');
      });

      it('should throw error for invalid Technicolor response', async () => {
        const mockResponse = {
          data: {
            error: 'failed',
          },
        };
        mockedAxios.get = jest.fn().mockResolvedValue(mockResponse);

        const discovery = new ModemDiscovery(mockModemLocation, mockLogger as any);
        
        await expect(discovery.tryTechnicolor()).rejects.toThrow('Could not determine modem type');
      });
    });

    describe('tryArris', () => {
      it('should make correct API call for Arris', async () => {
        const mockResponse = {
          data: '<html>firmware data</html>',
        };

        mockedExtractFirmwareVersion.mockReturnValue('AR01.03.045.12_042321_711.PC20.1');

        mockedAxios.get = jest.fn().mockResolvedValue(mockResponse);

        const discovery = new ModemDiscovery(mockModemLocation, mockLogger as any);
        const result = await discovery.tryArris();

        expect(mockedAxios.get).toHaveBeenCalledWith('http://192.168.1.1/index.php', {
          headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml',
          },
        });
        expect(result.deviceType).toBe('Arris');
      });

      it('should throw error when firmware version cannot be extracted', async () => {
        const mockResponse = {
          data: '<html>no firmware data</html>',
        };

        mockedExtractFirmwareVersion.mockReturnValue(undefined);

        mockedAxios.get = jest.fn().mockResolvedValue(mockResponse);

        const discovery = new ModemDiscovery(mockModemLocation, mockLogger as any);
        
        await expect(discovery.tryArris()).rejects.toThrow('Unable to parse firmware version.');
      });
    });
  });
}); 