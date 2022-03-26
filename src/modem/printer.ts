import type { DocsisStatus, HumanizedDocsis31ChannelStatus, HumanizedDocsisChannelStatus } from "./modem";

export class TablePrinter {

  head = [
    "ID",
    "Ch. Type",
    "Modulation",
    "Power",
    "Frequency",
    " Lock status ",
    "SNR "]

  constructor(private docsisStatus: DocsisStatus) { }

  get spacedHead(): string[] {
    return this.head.map(header => ` ${header} `)
  }

  get lineSeparator(): string {
    const dash = '-';
    const plus = '+'
    const dashes = this.spacedHead.map(word => dash.repeat(word.length))
    return ["", ...dashes, ""].join(plus)
  }

  lineText(...words: Array<string | number>): string {
    const paddedWords = words.map((word, index) => {
      const headerWord = this.head[index];
      return String(word).padEnd(headerWord.length, " ")
    })
    return ["", ...paddedWords, ""].join(" | ").trim()
  }

  tableHeader(): string {
    return `${this.lineSeparator}\n${this.lineText(...this.head)}\n${this.lineSeparator}`
  }

  tableRow(...words: Array<string | number>): string {
    return `${this.lineText(...words)}\n${this.lineSeparator}`
  }

  docsisStatusToRow(rowObjects: HumanizedDocsisChannelStatus[]): string {
    return rowObjects?.map(channelStatus => {
      return [channelStatus.channelId, channelStatus.channelType, channelStatus.modulation, channelStatus.powerLevel, channelStatus.frequency, channelStatus.lockStatus, channelStatus.snr]
    })
      .map(rowValues => this.tableRow(...rowValues))
      .join("\n") ?? ""
  }

  docsis31StatusToRow(rowObjects: HumanizedDocsis31ChannelStatus[]): string {
    return rowObjects?.map(channelStatus => {
      return [channelStatus.channelId, channelStatus.channelType, channelStatus.modulation, channelStatus.powerLevel, `${channelStatus.frequencyStart}-${channelStatus.frequencyEnd}`, channelStatus.lockStatus, channelStatus.snr]
    })
      .map(rowValues => this.tableRow(...rowValues))
      .join("\n") ?? ""
  }

  print(): string {
    const header = this.tableHeader();
    const downstream = this.docsisStatusToRow(this.docsisStatus.downstream)
    const downstreamOfdm = this.docsis31StatusToRow(this.docsisStatus.downstreamOfdm)
    const upstream = this.docsisStatusToRow(this.docsisStatus.upstream)
    const upstreamOfdma = this.docsis31StatusToRow(this.docsisStatus.upstreamOfdma)

    return `
Downstream\n${header}\n${downstream}\n
Downstream OFDM\n${header}\n${downstreamOfdm}\n
Upstream\n${header}\n${upstream}\n
Upstream OFDMA\n${header}\n${upstreamOfdma}
`
  }

}

export function createTableLine(): string {
  return "";
}

export function prettyPrint(docsisStatus: DocsisStatus): string {
  return ""
}