import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';
import { createXml } from './xml-builder';
import { ISpreadsheet } from './types';

const { Cols } = ISpreadsheet.Enum;

export class CreaturesParser {
  private readonly _spreadsheet: GoogleSpreadsheet;
  private _rows: GoogleSpreadsheetRow[] = [];

  constructor(spreadsheetId: string, apiKey: string) {
    if (!apiKey) {
      throw new Error('API Key is not provided!');
    }

    this._spreadsheet = new GoogleSpreadsheet(spreadsheetId);

    this._spreadsheet.useApiKey(apiKey);
  }

  public async loadSpreadsheet(spreadsheetName?: string) {
    try {
      await this._spreadsheet.loadInfo();

      const sheet = spreadsheetName
        ? this._spreadsheet.sheetsByTitle[spreadsheetName]
        : this._spreadsheet.sheetsByIndex[0];

      this._rows = await sheet.getRows();
    } catch (e) {
      console.log(e);

      throw new Error('There was an error loading spreadsheet!');
    }
  }

  public manualParse([start, end]: number[]) {
    const creatures: string[][] = this._rows
      .filter(({ rowIndex }) => rowIndex >= start && rowIndex <= end)
      .map(({ _rawData }) => _rawData);

    return createXml(creatures);
  }

  public autoParse() {
    const rowIndexAfterLastCreature: number =
      this._rows.find(
        ({ _rawData }) =>
          _rawData[Cols.Name] === '' && _rawData[Cols.HP] !== 'HP',
      )?.rowIndex || this._rows.length;

    const headerRowsIndexBetweenCreatures: number[] = this._rows
      .filter(({ _rawData }) => _rawData[Cols.HP] === 'HP')
      .map(({ rowIndex }) => rowIndex);

    headerRowsIndexBetweenCreatures.push(rowIndexAfterLastCreature);

    const creatures: string[][] = headerRowsIndexBetweenCreatures
      .map((headerIndex, index, arr) => {
        const headerIndexFromRowsArr = this._rows.findIndex(
          ({ rowIndex }) => rowIndex === headerIndex,
        );

        const nextHeaderIndexFromRowsArr = this._rows.findIndex(
          ({ rowIndex }) => rowIndex === arr[index + 1],
        );

        if (headerIndexFromRowsArr === -1) {
          throw new Error(`${headerIndex} row was not found in spreadsheet`);
        }

        if (index === 0) {
          return this._rows.slice(
            headerIndexFromRowsArr + 1,
            nextHeaderIndexFromRowsArr,
          );
        }

        if (arr[index + 1]) {
          return this._rows.slice(
            headerIndexFromRowsArr + 1,
            nextHeaderIndexFromRowsArr,
          );
        }

        return this._rows.slice(
          headerIndexFromRowsArr,
          rowIndexAfterLastCreature - 2,
        );
      })
      .flat()
      .map(({ _rawData }) => _rawData);

    return createXml(creatures);
  }
}
