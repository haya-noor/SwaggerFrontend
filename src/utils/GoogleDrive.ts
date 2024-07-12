import fs from 'fs';
import fetch from 'node-fetch'; 
import { AbstractGoogleDrive } from './AbstractGoogleDrive.ts';

export class GoogleDrive extends AbstractGoogleDrive {
  async fetchFile(fileName: string, folderId: string): Promise<any[]> {
    try {
      const searchResponse = await this.drive.files.list({
        q: `name contains '${fileName}' and '${folderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
      });

      return searchResponse.data.files ?? [];
    } catch (error) {
      console.error('Error searching file:', error);
      return [];
    }
  }

  async downloadFile(fileId: string, filePath: string): Promise<void> {
    const dest = fs.createWriteStream(filePath);
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const headers = {
      Authorization: `Bearer ${await this.auth.getAccessToken()}`,
    };

    const response = await fetch(url, { headers });

    if (response.ok && response.body) {
      const stream = response.body.pipe(dest);
      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          console.log(`File downloaded successfully to ${filePath}.`);
          resolve();
        });
        stream.on('error', (err) => {
          console.error('Error downloading file:', err);
          reject(err);
        });
      });
    } else {
      throw new Error(`Unexpected response format or empty body: ${response.status} ${response.statusText}`);
    }
  }
}
