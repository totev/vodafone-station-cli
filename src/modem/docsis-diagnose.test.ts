import DocsisDiagnose, { FixWithinOneMonth, checkSignalToNoise, downstreamDeviation, DownstreamDeviation64QAM, downstreamDeviationFactory, FixImmediately, ToleratedDeviation, upstreamDeviation, upstreamDeviationFactory, UpstreamDeviationOFDMA, UpstreamDeviationSCQAM, CompliesToSpecifications } from "./docsis-diagnose";
import type { DocsisChannelType, DocsisStatus, Modulation } from "./modem";
import fixtureDocsisStatusArris from './__fixtures__/docsisStatus_arris_normalized.json';
import fixtureDocsisStatus from './__fixtures__/docsisStatus_normalized.json';
import fixtureDocsisStatusMinimal from './__fixtures__/docsisStatus_normalized_minimal.json';

test('constructor', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatus as DocsisStatus);
  expect(diagnoser).toBeTruthy();
});

test('checkDownstream', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatus as DocsisStatus);
  const result = diagnoser.checkDownstream() 
  expect(result).toHaveLength(32);
  expect(result).toMatchSnapshot();
});

test('checkOfdmDownstream', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatus as DocsisStatus);
  const result = diagnoser.checkOfdmDownstream() 
  expect(result).toHaveLength(1);
  expect(result).toMatchSnapshot();
});

test('checkUpstream', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatus as DocsisStatus);
  const result = diagnoser.checkUpstream() 
  expect(result).toHaveLength(4);
  expect(result).toMatchSnapshot();
});

test('checkOfdmaUpstream', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatus as DocsisStatus);
  const result = diagnoser.checkOfdmaUpstream() 
  expect(result).toHaveLength(1);
  expect(result).toMatchSnapshot();
});

test('deviationFactory unsupported modulation/type', () => {
  expect(()=>downstreamDeviationFactory("8192AM" as Modulation)).toThrowError()
  expect(()=>upstreamDeviationFactory("OFDM" as DocsisChannelType)).toThrowError()
});
test('deviationFactory supported modulation/type', () => {
  expect(downstreamDeviationFactory("64QAM" as Modulation)).toStrictEqual(new DownstreamDeviation64QAM())
  expect(upstreamDeviationFactory("SC-QAM" as const)).toStrictEqual(new UpstreamDeviationSCQAM())
  expect(upstreamDeviationFactory("OFDMA" as const)).toStrictEqual(new UpstreamDeviationOFDMA())
});

test('hasDeviations with deviations', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatus as DocsisStatus);
  expect(diagnoser.hasDeviations()).toBeTruthy();
});

test('hasDeviations without deviations', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatusMinimal as DocsisStatus);
  expect(diagnoser.hasDeviations()).toBeFalsy();
});


describe('diagnoseUpstream', () => {
  test.each([
    [-70,	 FixImmediately],
    [-56,	 FixImmediately],
    [-35,	 FixImmediately],
    [-4,	 FixImmediately],
    [0,	 FixImmediately],
    [10,	 FixImmediately],
    [35,	 FixImmediately],
    [35.1, FixWithinOneMonth],
    [36, FixWithinOneMonth],
    [37, FixWithinOneMonth],
    [37.1, ToleratedDeviation],
    [40, ToleratedDeviation],
    [41, ToleratedDeviation],
    [41.1, CompliesToSpecifications],
    [45, CompliesToSpecifications],
    [47, CompliesToSpecifications],
    [47.1, ToleratedDeviation],
    [49, ToleratedDeviation],
    [51, ToleratedDeviation],
    [51.1, FixWithinOneMonth],
    [52, FixWithinOneMonth],
    [53, FixWithinOneMonth],
    [53.1,	 FixImmediately],
    [60,	 FixImmediately],
    [70,	 FixImmediately],
  ])
  ('upstreamDeviationDeviationSCQAM(%d)', (input, expected ) => {
    expect(upstreamDeviation({powerLevel:input, channelType:"SC-QAM"})).toBe(expected);
  });
  
  test.each([
    [-60,	 FixImmediately],
    [-50,	 FixImmediately],
    [-30,	 FixImmediately],
    [-4,	 FixImmediately],
    [0,	 FixImmediately],
    [10,	 FixImmediately],
    [20,	 FixImmediately],
    [30,	 FixImmediately],
    [38,	 FixImmediately],
    [38.1, FixWithinOneMonth],
    [39, FixWithinOneMonth],
    [39.9, FixWithinOneMonth],
    [40, FixWithinOneMonth],
    [40.1, ToleratedDeviation],
    [41, ToleratedDeviation],
    [42, ToleratedDeviation],
    [44, ToleratedDeviation],
    [44.1, CompliesToSpecifications],
    [45, CompliesToSpecifications],
    [47, CompliesToSpecifications],
    [47.1, ToleratedDeviation],
    [47.55, ToleratedDeviation],
    [48, ToleratedDeviation],
    [48.1, FixWithinOneMonth],
    [49, FixWithinOneMonth],
    [50, FixWithinOneMonth],
    [50.1,	 FixImmediately],
    [60,	 FixImmediately],
    [70,	 FixImmediately],
  ])
  ('upstreamDeviationDeviationOFDMA(%d)', (input, expected ) => {
    expect(upstreamDeviation({powerLevel:input, channelType:"OFDMA"})).toBe(expected);
  });
});

describe('diagnoseDownstream', () => {

  test.each`
    input	| expected
    ${{modulation:"64QAM", powerLevel:-60}}	| ${FixImmediately}
    ${{modulation:"64QAM", powerLevel:-50}}	| ${FixImmediately}
    ${{modulation:"64QAM", powerLevel:-14}}	| ${FixImmediately}
    ${{modulation:"64QAM", powerLevel:-13.9}}	| ${FixWithinOneMonth}
    ${{modulation:"64QAM", powerLevel:-13}}	| ${FixWithinOneMonth}
    ${{modulation:"64QAM", powerLevel:-12}}	| ${FixWithinOneMonth}
    ${{modulation:"64QAM", powerLevel:-11.9}}	| ${ToleratedDeviation}
    ${{modulation:"64QAM", powerLevel:-10.5}}	| ${ToleratedDeviation}
    ${{modulation:"64QAM", powerLevel:-10}}	| ${ToleratedDeviation}
    ${{modulation:"64QAM", powerLevel:-9.9}}	| ${CompliesToSpecifications}
    ${{modulation:"64QAM", powerLevel:-9}}	| ${CompliesToSpecifications}
    ${{modulation:"64QAM", powerLevel:-8}}	| ${CompliesToSpecifications}
    ${{modulation:"64QAM", powerLevel:-7}}	| ${CompliesToSpecifications}
    ${{modulation:"64QAM", powerLevel:0}}	| ${CompliesToSpecifications}
    ${{modulation:"64QAM", powerLevel:5}}	| ${CompliesToSpecifications}
    ${{modulation:"64QAM", powerLevel:7}}	| ${CompliesToSpecifications}
    ${{modulation:"64QAM", powerLevel:7.1}}	| ${ToleratedDeviation}
    ${{modulation:"64QAM", powerLevel:10}}	| ${ToleratedDeviation}
    ${{modulation:"64QAM", powerLevel:11.99}}	| ${ToleratedDeviation}
    ${{modulation:"64QAM", powerLevel:12}}	| ${ToleratedDeviation}
    ${{modulation:"64QAM", powerLevel:12.1}}	| ${FixWithinOneMonth}
    ${{modulation:"64QAM", powerLevel:13}}	| ${FixWithinOneMonth}
    ${{modulation:"64QAM", powerLevel:14}}	| ${FixWithinOneMonth}
    ${{modulation:"64QAM", powerLevel:14.1}}	| ${FixImmediately}
    ${{modulation:"64QAM", powerLevel:100}}	| ${FixImmediately}
  `('downstreamDeviation($input)', ({ input, expected }) => {
    expect(downstreamDeviation(input)).toBe(expected);
  });

  test.each`
    input	| expected
    ${{modulation:"256QAM", powerLevel:-60}}	| ${FixImmediately}
    ${{modulation:"256QAM", powerLevel:-50}}	| ${FixImmediately}
    ${{modulation:"256QAM", powerLevel:-8}}	| ${FixImmediately}
    ${{modulation:"256QAM", powerLevel:-7.9}}	| ${FixWithinOneMonth}
    ${{modulation:"256QAM", powerLevel:-7}}	| ${FixWithinOneMonth}
    ${{modulation:"256QAM", powerLevel:-6}}	| ${FixWithinOneMonth}
    ${{modulation:"256QAM", powerLevel:-5.9}}	| ${ToleratedDeviation}
    ${{modulation:"256QAM", powerLevel:-4.5}}	| ${ToleratedDeviation}
    ${{modulation:"256QAM", powerLevel:-4}}	| ${ToleratedDeviation}
    ${{modulation:"256QAM", powerLevel:-3.9}}	| ${CompliesToSpecifications}
    ${{modulation:"256QAM", powerLevel:-3}}	| ${CompliesToSpecifications}
    ${{modulation:"256QAM", powerLevel:-2}}	| ${CompliesToSpecifications}
    ${{modulation:"256QAM", powerLevel:-1}}	| ${CompliesToSpecifications}
    ${{modulation:"256QAM", powerLevel:0}}	| ${CompliesToSpecifications}
    ${{modulation:"256QAM", powerLevel:11}}	| ${CompliesToSpecifications}
    ${{modulation:"256QAM", powerLevel:13}}	| ${CompliesToSpecifications}
    ${{modulation:"256QAM", powerLevel:13.1}}	| ${ToleratedDeviation}
    ${{modulation:"256QAM", powerLevel:16}}	| ${ToleratedDeviation}
    ${{modulation:"256QAM", powerLevel:17.99}}	| ${ToleratedDeviation}
    ${{modulation:"256QAM", powerLevel:18}}	| ${ToleratedDeviation}
    ${{modulation:"256QAM", powerLevel:18.1}}	| ${FixWithinOneMonth}
    ${{modulation:"256QAM", powerLevel:19}}	| ${FixWithinOneMonth}
    ${{modulation:"256QAM", powerLevel:20}}	| ${FixWithinOneMonth}
    ${{modulation:"256QAM", powerLevel:20.1}}	| ${FixImmediately}
    ${{modulation:"256QAM", powerLevel:100}}	| ${FixImmediately}
  `('downstreamDeviation($input)', ({ input, expected }) => {
    expect(downstreamDeviation(input)).toBe(expected);
  });

  
  test.each([
    [-60,	 FixImmediately],
    [-50,	 FixImmediately],
    [-6,	 FixImmediately],
    [-5.9, FixWithinOneMonth],
    [-5,	 FixWithinOneMonth],
    [-4,	 FixWithinOneMonth],
    [-3.9, ToleratedDeviation],
    [-2.5, ToleratedDeviation],
    [-2,	 ToleratedDeviation],
    [-1.9,	 CompliesToSpecifications],
    [-1,	   CompliesToSpecifications],
    [1,	   CompliesToSpecifications],
    [0,	   CompliesToSpecifications],
    [5,	   CompliesToSpecifications],
    [15,	   CompliesToSpecifications],
    [15.1,	 ToleratedDeviation],
    [18,	   ToleratedDeviation],
    [19.99, ToleratedDeviation],
    [20,	   ToleratedDeviation],
    [20.1,	 FixWithinOneMonth],
    [21,	   FixWithinOneMonth],
    [22,	   FixWithinOneMonth],
    [22.1,	 FixImmediately],
    [100,	 FixImmediately],
  ])
  ('downstreamDeviation1024QAM(%d)', (input, expected ) => {
    expect(downstreamDeviation({powerLevel:input, modulation:"1024QAM"})).toBe(expected);
  });
  
  test.each([
    [-56,	 FixImmediately],
    [-48,	 FixImmediately],
    [-4,	 FixImmediately],
    [-3.9, FixWithinOneMonth],
    [-3,	 FixWithinOneMonth],
    [-2,	 FixWithinOneMonth],
    [-1.9, ToleratedDeviation],
    [-0.5, ToleratedDeviation],
    [0,	 ToleratedDeviation],
    [0.1,	 CompliesToSpecifications],
    [1,	   CompliesToSpecifications],
    [7,	   CompliesToSpecifications],
    [8,	   CompliesToSpecifications],
    [13,	   CompliesToSpecifications],
    [17,	   CompliesToSpecifications],
    [17.1,	 ToleratedDeviation],
    [20,	   ToleratedDeviation],
    [21.99, ToleratedDeviation],
    [22,	   ToleratedDeviation],
    [22.1,	 FixWithinOneMonth],
    [23,	   FixWithinOneMonth],
    [24,	   FixWithinOneMonth],
    [24.1,	 FixImmediately],
    [102,	 FixImmediately],
  ])
  ('downstreamDeviation2048QAM(%d)', (input, expected ) => {
    expect(downstreamDeviation({powerLevel:input, modulation:"2048QAM"})).toBe(expected);
  });


  test.each([
    [-54,	 FixImmediately],
    [-46,	 FixImmediately],
    [-2,	 FixImmediately],
    [-1.9, FixWithinOneMonth],
    [-1,	 FixWithinOneMonth],
    [0,	 FixWithinOneMonth],
    [0.1, ToleratedDeviation],
    [1.5, ToleratedDeviation],
    [2,	 ToleratedDeviation],
    [2.1,	 CompliesToSpecifications],
    [3,	   CompliesToSpecifications],
    [9,	   CompliesToSpecifications],
    [10,	   CompliesToSpecifications],
    [15,	   CompliesToSpecifications],
    [19,	   CompliesToSpecifications],
    [19.1,	 ToleratedDeviation],
    [22,	   ToleratedDeviation],
    [23.99, ToleratedDeviation],
    [24,	   ToleratedDeviation],
    [24.1,	 FixWithinOneMonth],
    [25,	   FixWithinOneMonth],
    [26,	   FixWithinOneMonth],
    [26.1,	 FixImmediately],
    [104,	 FixImmediately],
  ])
  ('downstreamDeviation4096QAM(%d)', (input, expected ) => {
    expect(downstreamDeviation({powerLevel:input, modulation:"4096QAM"})).toBe(expected);
  });
  
});

describe('signalToNoise', () => {

  test.each([
    [-50,	 FixImmediately],
    [-10,	 FixImmediately],
    [-1,	 FixImmediately],
    [0,	 FixImmediately],
    [10,	 FixImmediately],
    [20,	 FixImmediately],
    [24,	 FixImmediately],
    [24.1, FixWithinOneMonth],
    [25, FixWithinOneMonth],
    [26, FixWithinOneMonth],
    [26.1, ToleratedDeviation],
    [26.6, ToleratedDeviation],
    [27,	 ToleratedDeviation],
    [27.1,	 CompliesToSpecifications],
    [28,	   CompliesToSpecifications],
    [30,	   CompliesToSpecifications],
    [35,	   CompliesToSpecifications],
  ])
  ('checkSignalToNoise64QAM(%d)', (input, expected ) => {
    expect(checkSignalToNoise({ snr: input, modulation: "64QAM" })).toBe(expected);
  });

  test.each([
    [-50,	 FixImmediately],
    [-10,	 FixImmediately],
    [-1,	 FixImmediately],
    [0,	 FixImmediately],
    [10,	 FixImmediately],
    [20,	 FixImmediately],
    [24,	 FixImmediately],
    [29.9,	 FixImmediately],
    [30,	 FixImmediately],
    [30.1, FixWithinOneMonth],
    [31, FixWithinOneMonth],
    [32, FixWithinOneMonth],
    [32.1, ToleratedDeviation],
    [32.6, ToleratedDeviation],
    [33,	 ToleratedDeviation],
    [33.1,	 CompliesToSpecifications],
    [34,	   CompliesToSpecifications],
    [40,	   CompliesToSpecifications],
    [45,	   CompliesToSpecifications],
  ])
  ('checkSignalToNoise256QAM(%d)', (input, expected ) => {
    expect(checkSignalToNoise({ snr: input, modulation: "256QAM" })).toBe(expected);
  });

  test.each([
    [-50,	 FixImmediately],
    [-10,	 FixImmediately],
    [-1,	 FixImmediately],
    [0,	 FixImmediately],
    [10,	 FixImmediately],
    [20,	 FixImmediately],
    [24,	 FixImmediately],
    [35.9,	 FixImmediately],
    [36,	 FixImmediately],
    [36.1, FixWithinOneMonth],
    [37.99, FixWithinOneMonth],
    [38, FixWithinOneMonth],
    [38.1, ToleratedDeviation],
    [38.6, ToleratedDeviation],
    [39,	 ToleratedDeviation],
    [39.1,	 CompliesToSpecifications],
    [40,	   CompliesToSpecifications],
    [47,	   CompliesToSpecifications],
    [50,	   CompliesToSpecifications],
  ])
  ('checkSignalToNoise1024QAM(%d)', (input, expected ) => {
    expect(checkSignalToNoise({ snr: input, modulation: "1024QAM" })).toBe(expected);
  });

  test.each([
    [-50,	 FixImmediately],
    [-10,	 FixImmediately],
    [-1,	 FixImmediately],
    [0,	 FixImmediately],
    [10,	 FixImmediately],
    [20,	 FixImmediately],
    [24,	 FixImmediately],
    [38.9,	 FixImmediately],
    [39,	 FixImmediately],
    [39.1, FixWithinOneMonth],
    [39.99, FixWithinOneMonth],
    [41, FixWithinOneMonth],
    [41.1, ToleratedDeviation],
    [41.6, ToleratedDeviation],
    [42,	 ToleratedDeviation],
    [43.1,	 CompliesToSpecifications],
    [45,	   CompliesToSpecifications],
    [47,	   CompliesToSpecifications],
    [50,	   CompliesToSpecifications],
  ])
  ('checkSignalToNoise2048QAM(%d)', (input, expected) => {
    expect(checkSignalToNoise({ snr: input, modulation: "2048QAM" })).toBe(expected);
  });

  test.each([
    [-50,	 FixImmediately],
    [-10,	 FixImmediately],
    [-1,	 FixImmediately],
    [0,	 FixImmediately],
    [10,	 FixImmediately],
    [20,	 FixImmediately],
    [30,	 FixImmediately],
    [40,	 FixImmediately],
    [41.9,	 FixImmediately],
    [42,	 FixImmediately],
    [42.1, FixWithinOneMonth],
    [42.99, FixWithinOneMonth],
    [43, FixWithinOneMonth],
    [44, FixWithinOneMonth],
    [44.1, ToleratedDeviation],
    [44.6, ToleratedDeviation],
    [45,	 ToleratedDeviation],
    [45.1,	 CompliesToSpecifications],
    [46,	   CompliesToSpecifications],
    [47,	   CompliesToSpecifications],
    [50,	   CompliesToSpecifications],
  ])
  ('checkSignalToNoise4096QAM(%d)', (input, expected ) => {
    expect(checkSignalToNoise({ snr: input, modulation: "4096QAM"})).toBe(expected);
  });

});

test('printDeviationsConsole with pl deviations', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatusArris as DocsisStatus);
  const result = diagnoser.printDeviationsConsole()
  console.log(result);
  expect(result).toContain("ch33pl");
});

test('printDeviationsConsole without deviations', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatusMinimal as DocsisStatus);
  const result = diagnoser.printDeviationsConsole()
  console.log(result);
  expect(result).toContain("Hooray");
});

test('printDeviationsConsole with snr deviations', () => {
  const fixture = {
    "downstream": [
      {
        "channelId": "2",
        "channelType": "SC-QAM",
        "modulation": "256QAM",
        "powerLevel": -5.6,
        "lockStatus": "Locked",
        "snr": 31,
        "frequency": 130
      },
    ],
    downstreamOfdm: [],
    upstream:[],
    upstreamOfdma:[],
  } as any as DocsisStatus
  const diagnoser = new DocsisDiagnose(fixture);
  const result = diagnoser.printDeviationsConsole()
  console.log(result);
  expect(result).toContain("snr");
});

