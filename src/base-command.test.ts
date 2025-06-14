import { Flags } from '@oclif/core';
import { ipFlag } from './base-command';

describe('Base Command', () => {
  describe('ipFlag', () => {
    it('should create an IP flag with correct properties', () => {
      const flag = ipFlag();
      
      expect(flag).toBeDefined();
      expect(flag.char).toBe('i');
      expect(flag.description).toBe('IP address of the modem/router (default: try 192.168.100.1 and 192.168.0.1)');
      expect(flag.required).toBeUndefined();
    });

    it('should be compatible with OCLIF flags', () => {
      const flags = {
        ip: ipFlag()
      };
      
      expect(flags.ip).toBeDefined();
    });
  });
}); 