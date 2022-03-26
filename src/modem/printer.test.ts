import { DocsisStatus, HumanizedDocsisChannelStatus } from "./modem";
import { TablePrinter } from "./printer";
import fixtureDocsisStatus from './__fixtures__/docsisStatus_normalized.json';


describe('TablePrinter', () => {
  const printer = new TablePrinter(fixtureDocsisStatus as any)

  test('spacedHead spaces with one space before and after string', () => {
    expect(printer.spacedHead).toHaveLength(printer.head.length)
    expect(printer.spacedHead.map(head => head.length)).toEqual(printer.head.map(head => head.length + 2))
  });

  test('lineSeparator', () => {
    const expected = "+----+----------+------------+-------+-----------+---------------+------+"
    expect(printer.lineSeparator).toEqual(expected)
  });

  test('lineText single word', () => {
    expect(printer.lineText('Test')).toEqual('| Test |')
  });

  test('lineText multi words', () => {
    expect(printer.lineText('Test', "Test2")).toEqual('| Test | Test2    |')
  });

  test('tableHeader', () => {
    const expeced = `
+----+----------+------------+-------+-----------+---------------+------+
| ID | Ch. Type | Modulation | Power | Frequency |  Lock status  | SNR  |
+----+----------+------------+-------+-----------+---------------+------+`.trim()
    expect(printer.tableHeader()).toEqual(expeced)
  });

  test('tableRow', () => {
    const expeced = `
| ID | Ch. Type | Modulation | Power | Frequency |  Lock status  | SNR  |
+----+----------+------------+-------+-----------+---------------+------+`.trim()
    expect(printer.tableRow(...printer.head)).toEqual(expeced)
  });

  test('print', () => {
    expect(printer.print()).toMatchSnapshot()
  });

});

test('should ', () => {
  const expected = `
Downstream
+----+----------+------------+-------+-----------+---------------+------+
| ID | Ch. Type | Modulation | Power | Frequency |  Lock status  | SNR  |
+----+----------+------------+-------+-----------+---------------+------+


Downstream OFDM
+----+----------+------------+-------+-----------+---------------+------+
| ID | Ch. Type | Modulation | Power | Frequency |  Lock status  | SNR  |
+----+----------+------------+-------+-----------+---------------+------+


Upstream
+----+----------+------------+-------+-----------+---------------+------+
| ID | Ch. Type | Modulation | Power | Frequency |  Lock status  | SNR  |
+----+----------+------------+-------+-----------+---------------+------+


Upstream OFDMA
+----+----------+------------+-------+-----------+---------------+------+
| ID | Ch. Type | Modulation | Power | Frequency |  Lock status  | SNR  |
+----+----------+------------+-------+-----------+---------------+------+
| 9  | OFDMA    | 16QAM      | NaN   | 29.8-NaN  | Not Completed | 0    |
+----+----------+------------+-------+-----------+---------------+------+
`
  const printer = new TablePrinter({
    upstreamOfdma: [{
      channelId: "9",
      channelType: "OFDMA",
      modulation: "16QAM",
      powerLevel: NaN,
      frequencyStart: 29.8,
      frequencyEnd: NaN,
      lockStatus: "Not Completed",
      snr: 0

    }]
  } as DocsisStatus)
  console.log(printer.print());
  
  expect(printer.print()).toStrictEqual(expected)

});