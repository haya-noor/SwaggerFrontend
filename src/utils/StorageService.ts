import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

export abstract class StorageService {
  protected auth: any;
  protected drive: any;

  constructor() {
    const keyFile = process.env['GOOGLE_SERVICE_ACCOUNT_KEY'];
    if (!keyFile) {
      throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_KEY in environment variables.');
    }

    this.auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  abstract fetchFile(fileName: string, folderId: string): Promise<any[]>;

  abstract downloadFile(fileId: string, filePath: string): Promise<void>;
}
