import { Command, flags } from "@oclif/command";
import { fetchDocsisStatus, login, logout } from "../client";
import { promises as fsp } from "fs";

export default class Docsis extends Command {
  static description =
    "Get the current docsis status as reported by the modem in a JSON format.";

  static examples = [
    `$ vodafone-station-cli docsis -p PASSWORD
JSON data
`,
  ];

  static flags = {
    password: flags.string({
      char: "p",
      required: true,
      description: "router/modem password",
    }),
    file: flags.boolean({
      char: "f",
      description: "write out a report file",
    }),
  };

  async getDocsisStatus(password: string) {
    try {
      const csrfNonce = await login(password);
      return fetchDocsisStatus(csrfNonce);
    } catch (error) {
      console.error("Something went wrong.", error);
    } finally {
      await logout();
    }
  }

  async writeDocsisStatus(docsisStatusJson: string): Promise<void> {
    const reportFile = `reports/${Date.now()}_doscsisReport.json`;
    this.log("Writing docsis report as json to file: ", reportFile);
    const data = new Uint8Array(Buffer.from(docsisStatusJson));
    return fsp.writeFile(reportFile, data);
  }

  async run() {
    const { flags } = this.parse(Docsis);

    const docsisStatus = await this.getDocsisStatus(flags.password);
    const docsisStatusJSON = JSON.stringify(docsisStatus, undefined, 4);

    this.log(docsisStatusJSON);
    if (flags.file) {
      await this.writeDocsisStatus(docsisStatusJSON);
    }
  }
}
