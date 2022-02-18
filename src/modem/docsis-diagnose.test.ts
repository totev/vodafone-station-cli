import DocsisDiagnose, { BeseitigungBinnenMonatsfrist, checkSignalToNoise, downstreamDeviation, DownstreamDeviation64QAM, downstreamDeviationFactory, SofortigeBeseitigung, TolerierteAbweichung, upstreamDeviation, upstreamDeviationFactory, UpstreamDeviationOFDMA, UpstreamDeviationSCQAM, Vorgabekonform } from "./docsis-diagnose";
import type { DocsisChannelType, DocsisStatus, Modulation } from "./modem";
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

test('detectDeviations with deviations', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatus as DocsisStatus);
  expect(diagnoser.detectDeviations()).toBeTruthy();
});

test('detectDeviations without deviations', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatusMinimal as DocsisStatus);
  expect(diagnoser.detectDeviations()).toBeFalsy();
});


describe('diagnoseUpstream', () => {
  test.each([
    [-70,	 SofortigeBeseitigung],
    [-56,	 SofortigeBeseitigung],
    [-35,	 SofortigeBeseitigung],
    [-4,	 SofortigeBeseitigung],
    [0,	 SofortigeBeseitigung],
    [10,	 SofortigeBeseitigung],
    [35,	 SofortigeBeseitigung],
    [35.1, BeseitigungBinnenMonatsfrist],
    [36, BeseitigungBinnenMonatsfrist],
    [37, BeseitigungBinnenMonatsfrist],
    [37.1, TolerierteAbweichung],
    [40, TolerierteAbweichung],
    [41, TolerierteAbweichung],
    [41.1, Vorgabekonform],
    [45, Vorgabekonform],
    [47, Vorgabekonform],
    [47.1, TolerierteAbweichung],
    [49, TolerierteAbweichung],
    [51, TolerierteAbweichung],
    [51.1, BeseitigungBinnenMonatsfrist],
    [52, BeseitigungBinnenMonatsfrist],
    [53, BeseitigungBinnenMonatsfrist],
    [53.1,	 SofortigeBeseitigung],
    [60,	 SofortigeBeseitigung],
    [70,	 SofortigeBeseitigung],
  ])
  ('upstreamDeviationDeviationSCQAM(%d)', (input, expected ) => {
    expect(upstreamDeviation({powerLevel:input, channelType:"SC-QAM"})).toBe(expected);
  });
  
  test.each([
    [-60,	 SofortigeBeseitigung],
    [-50,	 SofortigeBeseitigung],
    [-30,	 SofortigeBeseitigung],
    [-4,	 SofortigeBeseitigung],
    [0,	 SofortigeBeseitigung],
    [10,	 SofortigeBeseitigung],
    [20,	 SofortigeBeseitigung],
    [30,	 SofortigeBeseitigung],
    [38,	 SofortigeBeseitigung],
    [38.1, BeseitigungBinnenMonatsfrist],
    [39, BeseitigungBinnenMonatsfrist],
    [39.9, BeseitigungBinnenMonatsfrist],
    [40, BeseitigungBinnenMonatsfrist],
    [40.1, TolerierteAbweichung],
    [41, TolerierteAbweichung],
    [42, TolerierteAbweichung],
    [44, TolerierteAbweichung],
    [44.1, Vorgabekonform],
    [45, Vorgabekonform],
    [47, Vorgabekonform],
    [47.1, TolerierteAbweichung],
    [47.55, TolerierteAbweichung],
    [48, TolerierteAbweichung],
    [48.1, BeseitigungBinnenMonatsfrist],
    [49, BeseitigungBinnenMonatsfrist],
    [50, BeseitigungBinnenMonatsfrist],
    [50.1,	 SofortigeBeseitigung],
    [60,	 SofortigeBeseitigung],
    [70,	 SofortigeBeseitigung],
  ])
  ('upstreamDeviationDeviationOFDMA(%d)', (input, expected ) => {
    expect(upstreamDeviation({powerLevel:input, channelType:"OFDMA"})).toBe(expected);
  });
});

describe('diagnoseDownstream', () => {

  test.each`
    input	| expected
    ${{modulation:"64QAM", powerLevel:-60}}	| ${SofortigeBeseitigung}
    ${{modulation:"64QAM", powerLevel:-50}}	| ${SofortigeBeseitigung}
    ${{modulation:"64QAM", powerLevel:-14}}	| ${SofortigeBeseitigung}
    ${{modulation:"64QAM", powerLevel:-13.9}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"64QAM", powerLevel:-13}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"64QAM", powerLevel:-12}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"64QAM", powerLevel:-11.9}}	| ${TolerierteAbweichung}
    ${{modulation:"64QAM", powerLevel:-10.5}}	| ${TolerierteAbweichung}
    ${{modulation:"64QAM", powerLevel:-10}}	| ${TolerierteAbweichung}
    ${{modulation:"64QAM", powerLevel:-9.9}}	| ${Vorgabekonform}
    ${{modulation:"64QAM", powerLevel:-9}}	| ${Vorgabekonform}
    ${{modulation:"64QAM", powerLevel:-8}}	| ${Vorgabekonform}
    ${{modulation:"64QAM", powerLevel:-7}}	| ${Vorgabekonform}
    ${{modulation:"64QAM", powerLevel:0}}	| ${Vorgabekonform}
    ${{modulation:"64QAM", powerLevel:5}}	| ${Vorgabekonform}
    ${{modulation:"64QAM", powerLevel:7}}	| ${Vorgabekonform}
    ${{modulation:"64QAM", powerLevel:7.1}}	| ${TolerierteAbweichung}
    ${{modulation:"64QAM", powerLevel:10}}	| ${TolerierteAbweichung}
    ${{modulation:"64QAM", powerLevel:11.99}}	| ${TolerierteAbweichung}
    ${{modulation:"64QAM", powerLevel:12}}	| ${TolerierteAbweichung}
    ${{modulation:"64QAM", powerLevel:12.1}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"64QAM", powerLevel:13}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"64QAM", powerLevel:14}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"64QAM", powerLevel:14.1}}	| ${SofortigeBeseitigung}
    ${{modulation:"64QAM", powerLevel:100}}	| ${SofortigeBeseitigung}
  `('downstreamDeviation($input)', ({ input, expected }) => {
    expect(downstreamDeviation(input)).toBe(expected);
  });

  test.each`
    input	| expected
    ${{modulation:"256QAM", powerLevel:-60}}	| ${SofortigeBeseitigung}
    ${{modulation:"256QAM", powerLevel:-50}}	| ${SofortigeBeseitigung}
    ${{modulation:"256QAM", powerLevel:-8}}	| ${SofortigeBeseitigung}
    ${{modulation:"256QAM", powerLevel:-7.9}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"256QAM", powerLevel:-7}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"256QAM", powerLevel:-6}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"256QAM", powerLevel:-5.9}}	| ${TolerierteAbweichung}
    ${{modulation:"256QAM", powerLevel:-4.5}}	| ${TolerierteAbweichung}
    ${{modulation:"256QAM", powerLevel:-4}}	| ${TolerierteAbweichung}
    ${{modulation:"256QAM", powerLevel:-3.9}}	| ${Vorgabekonform}
    ${{modulation:"256QAM", powerLevel:-3}}	| ${Vorgabekonform}
    ${{modulation:"256QAM", powerLevel:-2}}	| ${Vorgabekonform}
    ${{modulation:"256QAM", powerLevel:-1}}	| ${Vorgabekonform}
    ${{modulation:"256QAM", powerLevel:0}}	| ${Vorgabekonform}
    ${{modulation:"256QAM", powerLevel:11}}	| ${Vorgabekonform}
    ${{modulation:"256QAM", powerLevel:13}}	| ${Vorgabekonform}
    ${{modulation:"256QAM", powerLevel:13.1}}	| ${TolerierteAbweichung}
    ${{modulation:"256QAM", powerLevel:16}}	| ${TolerierteAbweichung}
    ${{modulation:"256QAM", powerLevel:17.99}}	| ${TolerierteAbweichung}
    ${{modulation:"256QAM", powerLevel:18}}	| ${TolerierteAbweichung}
    ${{modulation:"256QAM", powerLevel:18.1}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"256QAM", powerLevel:19}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"256QAM", powerLevel:20}}	| ${BeseitigungBinnenMonatsfrist}
    ${{modulation:"256QAM", powerLevel:20.1}}	| ${SofortigeBeseitigung}
    ${{modulation:"256QAM", powerLevel:100}}	| ${SofortigeBeseitigung}
  `('downstreamDeviation($input)', ({ input, expected }) => {
    expect(downstreamDeviation(input)).toBe(expected);
  });

  
  test.each([
    [-60,	 SofortigeBeseitigung],
    [-50,	 SofortigeBeseitigung],
    [-6,	 SofortigeBeseitigung],
    [-5.9, BeseitigungBinnenMonatsfrist],
    [-5,	 BeseitigungBinnenMonatsfrist],
    [-4,	 BeseitigungBinnenMonatsfrist],
    [-3.9, TolerierteAbweichung],
    [-2.5, TolerierteAbweichung],
    [-2,	 TolerierteAbweichung],
    [-1.9,	 Vorgabekonform],
    [-1,	   Vorgabekonform],
    [1,	   Vorgabekonform],
    [0,	   Vorgabekonform],
    [5,	   Vorgabekonform],
    [15,	   Vorgabekonform],
    [15.1,	 TolerierteAbweichung],
    [18,	   TolerierteAbweichung],
    [19.99, TolerierteAbweichung],
    [20,	   TolerierteAbweichung],
    [20.1,	 BeseitigungBinnenMonatsfrist],
    [21,	   BeseitigungBinnenMonatsfrist],
    [22,	   BeseitigungBinnenMonatsfrist],
    [22.1,	 SofortigeBeseitigung],
    [100,	 SofortigeBeseitigung],
  ])
  ('downstreamDeviation1024QAM(%d)', (input, expected ) => {
    expect(downstreamDeviation({powerLevel:input, modulation:"1024QAM"})).toBe(expected);
  });
  
  test.each([
    [-56,	 SofortigeBeseitigung],
    [-48,	 SofortigeBeseitigung],
    [-4,	 SofortigeBeseitigung],
    [-3.9, BeseitigungBinnenMonatsfrist],
    [-3,	 BeseitigungBinnenMonatsfrist],
    [-2,	 BeseitigungBinnenMonatsfrist],
    [-1.9, TolerierteAbweichung],
    [-0.5, TolerierteAbweichung],
    [0,	 TolerierteAbweichung],
    [0.1,	 Vorgabekonform],
    [1,	   Vorgabekonform],
    [7,	   Vorgabekonform],
    [8,	   Vorgabekonform],
    [13,	   Vorgabekonform],
    [17,	   Vorgabekonform],
    [17.1,	 TolerierteAbweichung],
    [20,	   TolerierteAbweichung],
    [21.99, TolerierteAbweichung],
    [22,	   TolerierteAbweichung],
    [22.1,	 BeseitigungBinnenMonatsfrist],
    [23,	   BeseitigungBinnenMonatsfrist],
    [24,	   BeseitigungBinnenMonatsfrist],
    [24.1,	 SofortigeBeseitigung],
    [102,	 SofortigeBeseitigung],
  ])
  ('downstreamDeviation2048QAM(%d)', (input, expected ) => {
    expect(downstreamDeviation({powerLevel:input, modulation:"2048QAM"})).toBe(expected);
  });


  test.each([
    [-54,	 SofortigeBeseitigung],
    [-46,	 SofortigeBeseitigung],
    [-2,	 SofortigeBeseitigung],
    [-1.9, BeseitigungBinnenMonatsfrist],
    [-1,	 BeseitigungBinnenMonatsfrist],
    [0,	 BeseitigungBinnenMonatsfrist],
    [0.1, TolerierteAbweichung],
    [1.5, TolerierteAbweichung],
    [2,	 TolerierteAbweichung],
    [2.1,	 Vorgabekonform],
    [3,	   Vorgabekonform],
    [9,	   Vorgabekonform],
    [10,	   Vorgabekonform],
    [15,	   Vorgabekonform],
    [19,	   Vorgabekonform],
    [19.1,	 TolerierteAbweichung],
    [22,	   TolerierteAbweichung],
    [23.99, TolerierteAbweichung],
    [24,	   TolerierteAbweichung],
    [24.1,	 BeseitigungBinnenMonatsfrist],
    [25,	   BeseitigungBinnenMonatsfrist],
    [26,	   BeseitigungBinnenMonatsfrist],
    [26.1,	 SofortigeBeseitigung],
    [104,	 SofortigeBeseitigung],
  ])
  ('downstreamDeviation4096QAM(%d)', (input, expected ) => {
    expect(downstreamDeviation({powerLevel:input, modulation:"4096QAM"})).toBe(expected);
  });
  
});

describe('signalToNoise', () => {

  test.each([
    [-50,	 SofortigeBeseitigung],
    [-10,	 SofortigeBeseitigung],
    [-1,	 SofortigeBeseitigung],
    [0,	 SofortigeBeseitigung],
    [10,	 SofortigeBeseitigung],
    [20,	 SofortigeBeseitigung],
    [24,	 SofortigeBeseitigung],
    [24.1, BeseitigungBinnenMonatsfrist],
    [25, BeseitigungBinnenMonatsfrist],
    [26, BeseitigungBinnenMonatsfrist],
    [26.1, TolerierteAbweichung],
    [26.6, TolerierteAbweichung],
    [27,	 TolerierteAbweichung],
    [27.1,	 Vorgabekonform],
    [28,	   Vorgabekonform],
    [30,	   Vorgabekonform],
    [35,	   Vorgabekonform],
  ])
  ('checkSignalToNoise64QAM(%d)', (input, expected ) => {
    expect(checkSignalToNoise(input,"64QAM")).toBe(expected);
  });

  test.each([
    [-50,	 SofortigeBeseitigung],
    [-10,	 SofortigeBeseitigung],
    [-1,	 SofortigeBeseitigung],
    [0,	 SofortigeBeseitigung],
    [10,	 SofortigeBeseitigung],
    [20,	 SofortigeBeseitigung],
    [24,	 SofortigeBeseitigung],
    [29.9,	 SofortigeBeseitigung],
    [30,	 SofortigeBeseitigung],
    [30.1, BeseitigungBinnenMonatsfrist],
    [31, BeseitigungBinnenMonatsfrist],
    [32, BeseitigungBinnenMonatsfrist],
    [32.1, TolerierteAbweichung],
    [32.6, TolerierteAbweichung],
    [33,	 TolerierteAbweichung],
    [33.1,	 Vorgabekonform],
    [34,	   Vorgabekonform],
    [40,	   Vorgabekonform],
    [45,	   Vorgabekonform],
  ])
  ('checkSignalToNoise256QAM(%d)', (input, expected ) => {
    expect(checkSignalToNoise(input,"256QAM")).toBe(expected);
  });
  test.each([
    [-50,	 SofortigeBeseitigung],
    [-10,	 SofortigeBeseitigung],
    [-1,	 SofortigeBeseitigung],
    [0,	 SofortigeBeseitigung],
    [10,	 SofortigeBeseitigung],
    [20,	 SofortigeBeseitigung],
    [24,	 SofortigeBeseitigung],
    [35.9,	 SofortigeBeseitigung],
    [36,	 SofortigeBeseitigung],
    [36.1, BeseitigungBinnenMonatsfrist],
    [37.99, BeseitigungBinnenMonatsfrist],
    [38, BeseitigungBinnenMonatsfrist],
    [38.1, TolerierteAbweichung],
    [38.6, TolerierteAbweichung],
    [39,	 TolerierteAbweichung],
    [39.1,	 Vorgabekonform],
    [40,	   Vorgabekonform],
    [47,	   Vorgabekonform],
    [50,	   Vorgabekonform],
  ])
  ('checkSignalToNoise1024QAM(%d)', (input, expected ) => {
    expect(checkSignalToNoise(input,"1024QAM")).toBe(expected);
  });

});
