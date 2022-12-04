// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('parse', {
  automatic: (spreadSheetLink: string, apiKey: string, sheetTitle: string) =>
    ipcRenderer.invoke('parseAutomatic', spreadSheetLink, apiKey, sheetTitle),

  manual: (
    spreadSheetLink: string,
    apiKey: string,
    sheetTitle: string,
    customRows: string,
  ) =>
    ipcRenderer.invoke(
      'parseManual',
      spreadSheetLink,
      apiKey,
      sheetTitle,
      customRows,
    ),
});
