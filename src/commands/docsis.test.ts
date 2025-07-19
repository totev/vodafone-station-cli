import { discoverModemLocation, ModemDiscovery } from '../modem/discovery';
import { modemFactory } from '../modem/factory';
import { getDocsisStatus } from './docsis';

// Mock all dependencies
jest.mock('../modem/discovery');
jest.mock('../modem/factory');

const mockLogger = {
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

const mockModem = {
  login: jest.fn(),
  logout: jest.fn(),
  docsis: jest.fn(),
};

describe('Docsis Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDocsisStatus', () => {
    it('should pass IP parameter to discovery', async () => {
      const mockModemLocation = { ipAddress: '192.168.1.100', protocol: 'http' as const };
      const mockModemInfo = { 
        deviceType: 'Technicolor' as const, 
        firmwareVersion: '1.0', 
        ipAddress: '192.168.1.100', 
        protocol: 'http' as const 
      };
      const mockDocsisData = { 
        downstream: [], 
        upstream: [], 
        uptime: '1 day' 
      };

      (discoverModemLocation as jest.Mock).mockResolvedValue(mockModemLocation);
      (ModemDiscovery.prototype.discover as jest.Mock).mockResolvedValue(mockModemInfo);
      (modemFactory as jest.Mock).mockReturnValue(mockModem);
      mockModem.login.mockResolvedValue(undefined);
      mockModem.docsis.mockResolvedValue(mockDocsisData);

      const result = await getDocsisStatus('password', mockLogger as any, { ip: '192.168.1.100' });

      expect(discoverModemLocation).toHaveBeenCalledWith({ ip: '192.168.1.100' });
      expect(result).toBe(mockDocsisData);
    });

    it('should work without IP parameter (use defaults)', async () => {
      const mockModemLocation = { ipAddress: '192.168.100.1', protocol: 'http' as const };
      const mockModemInfo = { 
        deviceType: 'Technicolor' as const, 
        firmwareVersion: '1.0', 
        ipAddress: '192.168.100.1', 
        protocol: 'http' as const 
      };
      const mockDocsisData = { 
        downstream: [], 
        upstream: [], 
        uptime: '1 day' 
      };

      (discoverModemLocation as jest.Mock).mockResolvedValue(mockModemLocation);
      (ModemDiscovery.prototype.discover as jest.Mock).mockResolvedValue(mockModemInfo);
      (modemFactory as jest.Mock).mockReturnValue(mockModem);
      mockModem.login.mockResolvedValue(undefined);
      mockModem.docsis.mockResolvedValue(mockDocsisData);

      const result = await getDocsisStatus('password', mockLogger as any);

      expect(discoverModemLocation).toHaveBeenCalledWith(undefined);
      expect(result).toBe(mockDocsisData);
    });

    it('should handle modem login failure', async () => {
      const mockModemLocation = { ipAddress: '192.168.1.100', protocol: 'http' as const };
      const mockModemInfo = { 
        deviceType: 'Technicolor' as const, 
        firmwareVersion: '1.0', 
        ipAddress: '192.168.1.100', 
        protocol: 'http' as const 
      };

      (discoverModemLocation as jest.Mock).mockResolvedValue(mockModemLocation);
      (ModemDiscovery.prototype.discover as jest.Mock).mockResolvedValue(mockModemInfo);
      (modemFactory as jest.Mock).mockReturnValue(mockModem);
      mockModem.login.mockRejectedValue(new Error('Login failed'));

      await expect(getDocsisStatus('password', mockLogger as any, { ip: '192.168.1.100' }))
        .rejects.toThrow('Login failed');

      expect(mockModem.logout).toHaveBeenCalled();
    });

    it('should handle discovery failure', async () => {
      (discoverModemLocation as jest.Mock).mockRejectedValue(new Error('Discovery failed'));

      await expect(getDocsisStatus('password', mockLogger as any, { ip: '192.168.1.100' }))
        .rejects.toThrow('Discovery failed');
    });

    it('should handle docsis fetch failure', async () => {
      const mockModemLocation = { ipAddress: '192.168.1.100', protocol: 'http' as const };
      const mockModemInfo = { 
        deviceType: 'Technicolor' as const, 
        firmwareVersion: '1.0', 
        ipAddress: '192.168.1.100', 
        protocol: 'http' as const 
      };

      (discoverModemLocation as jest.Mock).mockResolvedValue(mockModemLocation);
      (ModemDiscovery.prototype.discover as jest.Mock).mockResolvedValue(mockModemInfo);
      (modemFactory as jest.Mock).mockReturnValue(mockModem);
      mockModem.login.mockResolvedValue(undefined);
      mockModem.docsis.mockRejectedValue(new Error('Docsis fetch failed'));

      await expect(getDocsisStatus('password', mockLogger as any, { ip: '192.168.1.100' }))
        .rejects.toThrow('Docsis fetch failed');

      expect(mockModem.logout).toHaveBeenCalled();
    });

    it('should always call logout even on success', async () => {
      const mockModemLocation = { ipAddress: '192.168.1.100', protocol: 'http' as const };
      const mockModemInfo = { 
        deviceType: 'Technicolor' as const, 
        firmwareVersion: '1.0', 
        ipAddress: '192.168.1.100', 
        protocol: 'http' as const 
      };
      const mockDocsisData = { 
        downstream: [], 
        upstream: [], 
        uptime: '1 day' 
      };

      (discoverModemLocation as jest.Mock).mockResolvedValue(mockModemLocation);
      (ModemDiscovery.prototype.discover as jest.Mock).mockResolvedValue(mockModemInfo);
      (modemFactory as jest.Mock).mockReturnValue(mockModem);
      mockModem.login.mockResolvedValue(undefined);
      mockModem.docsis.mockResolvedValue(mockDocsisData);

      await getDocsisStatus('password', mockLogger as any, { ip: '192.168.1.100' });

      expect(mockModem.login).toHaveBeenCalledWith('password');
      expect(mockModem.docsis).toHaveBeenCalled();
      expect(mockModem.logout).toHaveBeenCalled();
    });
  });
}); 