import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import path from 'path';
const stream = require('stream'); // Use require instead of import
import { configs } from '../../../config/configs';
import FileUploadResponse from './file-upload-response';

@Injectable()
export class GoogleDriveService {
    private auth: any;

    constructor() {
        const keyFilePath = `${process.cwd()}/${configs.fileUpload.credentialFileName}`;

        this.auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: configs.fileUpload.scopes,
        });
    }

    async uploadFile(fileObject: Express.Multer.File, folderId: string): Promise<FileUploadResponse> {
        try {
            const bufferStream = new stream.PassThrough();
            bufferStream.end(fileObject.buffer);

            const timestamp = new Date().getTime();

            const { data } = await google.drive({ version: 'v3', auth: this.auth }).files.create({
                media: {
                    mimeType: fileObject.mimetype,
                    body: bufferStream,
                },
                requestBody: {
                    name: `${timestamp}-${fileObject.originalname}`,
                    parents: [folderId],
                },
                fields: 'id,name,webViewLink',
            });

            console.log(`Uploaded file name - ${data.name}, id - ${data.id}, link - ${data.webViewLink}`);
            return data as FileUploadResponse;
        } catch (error: any) {
            console.error('Failed to upload file', error);
            console.error('Error details:', error.message, error.code, error.errors);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    validateFile(file: Express.Multer.File | undefined): string | null {
        if (!file) return 'No file uploaded';

        if (!configs.fileUpload.imageMimeTypes.includes(file.mimetype)) {
            return 'Invalid file type. Only JPG, JPEG, and PNG are allowed.';
        }

        if (file.size < configs.fileUpload.minFileSize || file.size > configs.fileUpload.maxFileSize) {
            return `File size must be between ${configs.fileUpload.minFileSize / (1024 * 1024)}MB and ${configs.fileUpload.maxFileSize / (1024 * 1024)}MB.`;
        }

        return null;
    }

    async deleteFile(fileId: string): Promise<boolean> {
        try {
            await google.drive({ version: 'v3', auth: this.auth }).files.delete({ fileId: fileId });
            console.log(`Deleted file with id - ${fileId}`);
            return true;
        } catch (error) {
            throw new Error('Failed to delete file from Google Drive');
        }
    }
}
