import DocsisDiagnose, { BeseitigungBinnenMonatsfrist, downstreamDeviation, DownstreamDeviation64QAM, downstreamDeviationFactory, SofortigeBeseitigung, TolerierteAbweichung, Vorgabekonform } from "./docsis-diagnose";
import type { DocsisStatus, Modulation } from "./modem";
import fixtureDocsisStatus from './__fixtures__/docsisStatus_normalized.json';

test('constructor', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatus as DocsisStatus);
  expect(diagnoser).toBeTruthy();
});

test('checkDownstream', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatus as DocsisStatus);
  expect(diagnoser.checkDownstream()).toHaveLength(32);
});

test('deviationFactory unsupported modulation', () => {
  expect(()=>downstreamDeviationFactory("8192AM" as Modulation)).toThrowError()
});
test('deviationFactory supported modulation', () => {
  expect(downstreamDeviationFactory("64QAM" as Modulation)).toStrictEqual(new DownstreamDeviation64QAM())
});

test('detectDeviations', () => {
  const diagnoser = new DocsisDiagnose(fixtureDocsisStatus as DocsisStatus);
  expect(diagnoser.detectDeviations()).toBeTruthy();
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
});