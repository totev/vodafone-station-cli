import { normalizeModulation } from "./modem";

test.each`
  input	        | expected
  ${"64QAM"}	  | ${"64QAM"}
  ${"64-QAM"}	  | ${"64QAM"}
  ${"64qam"}    | ${"64QAM"}
  ${"64 qam"}	  | ${"64QAM"}
  ${"1024-qam"}	| ${"1024QAM"}
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
