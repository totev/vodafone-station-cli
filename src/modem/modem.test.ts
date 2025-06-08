import { Log } from "../logger";
import { normalizeModulation } from "./modem";
import { Technicolor } from "./technicolor-modem";

// Mock the cookie agents
jest.mock('http-cookie-agent/http', () => ({
  HttpCookieAgent: jest.fn().mockImplementation(() => ({})),
  HttpsCookieAgent: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({}),
  default: {
    create: jest.fn().mockReturnValue({}),
  },
}));

import axios from 'axios';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';

const mockLogger = {
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as Log;

describe('Modem axios configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should use HttpCookieAgent for HTTP protocol', () => {
    new Technicolor('192.168.1.1', 'http', mockLogger);

    expect(HttpCookieAgent).toHaveBeenCalledWith({
      cookies: { jar: expect.any(Object) },
      keepAlive: true,
    });

    expect(HttpsCookieAgent).not.toHaveBeenCalled();

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        httpAgent: expect.any(Object),
      })
    );

    // Verify that httpsAgent is not set
    const configArg = (axios.create as jest.Mock).mock.calls[0][0];
    expect(configArg).not.toHaveProperty('httpsAgent');
  });

  test('should use HttpsCookieAgent for HTTPS protocol', () => {
    new Technicolor('192.168.1.1', 'https', mockLogger);

    expect(HttpsCookieAgent).toHaveBeenCalledWith({
      cookies: { jar: expect.any(Object) },
      keepAlive: true,
      rejectUnauthorized: false,
    });

    expect(HttpCookieAgent).not.toHaveBeenCalled();

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        httpsAgent: expect.any(Object),
      })
    );

    // Verify that httpAgent is not set
    const configArg = (axios.create as jest.Mock).mock.calls[0][0];
    expect(configArg).not.toHaveProperty('httpAgent');
  });

  test('should configure axios with correct base settings', () => {
    new Technicolor('192.168.1.1', 'http', mockLogger);

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://192.168.1.1',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        timeout: 45_000,
        withCredentials: true,
      })
    );
  });
});

test.each`
  input	        | expected
  ${"64QAM"}	  | ${"64QAM"}
  ${"64-QAM"}	  | ${"64QAM"}
  ${"64qam"}    | ${"64QAM"}
  ${"64 qam"}	  | ${"64QAM"}
  ${"1024-qam"}	| ${"1024QAM"}
  ${"Unknown"}  | ${"Unknown"}
`('normalizeModulation($input)', ({ input, expected }) => {
  expect(normalizeModulation(input)).toBe(expected);
});

test.each`
  input	        | expected
  ${"256QAM/1024QAM"}	  | ${"256QAM"}
  ${"64 QAM/1024QAM"}	  | ${"64QAM"}
  ${"1024-qam/1024QAM"}	  | ${"1024QAM"}
`('normalizeModulation($input)', ({ input, expected }) => {
  expect(normalizeModulation(input)).toBe(expected);
});

test('normalizeModulation should handle empty input', () => {
  expect(() => normalizeModulation('')).toThrow('Empty modulation value received: ""');
});

test('normalizeModulation should handle unknown input', () => {
  expect(() => normalizeModulation('invalid')).toThrow('Unknown modulation "invalid" (normalized: "INVALID")');
});
