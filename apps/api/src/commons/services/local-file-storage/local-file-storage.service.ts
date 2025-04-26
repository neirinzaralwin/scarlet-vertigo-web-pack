import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { configs } from '../../../config/configs';

export interface LocalFileUploadResponse {
    fileName: string;
    filePath: string; // Relative path for URL generation (e.g., /static/uploads/products/filename.jpg)
    fullPath: string; // Absolute path for file system operations
}

@Injectable()
export class LocalFileStorageService {
    private readonly logger = new Logger(LocalFileStorageService.name);
    private readonly uploadPath: string;
    private readonly baseUrl: string; // Base URL prefix for accessing files, e.g., /static/uploads/products

    constructor() {
        // Define the base directory relative to the project root where 'dist' will be
        // Files will be saved in dist/apps/api/public/uploads/products
        const baseDir = path.join(process.cwd(), 'dist', 'apps', 'api', 'public');
        this.uploadPath = path.join(baseDir, 'uploads', 'products');
        // This URL path should match the combination of serveRoot and the subpath within rootPath
        this.baseUrl = '/static/uploads/products';

        this.ensureDirectoryExists(this.uploadPath);
    }

    private ensureDirectoryExists(directory: string) {
        if (!fs.existsSync(directory)) {
            try {
                // Use { recursive: true } to create parent directories if they don't exist
                fs.mkdirSync(directory, { recursive: true });
                this.logger.log(`Created directory: ${directory}`);
            } catch (error) {
                this.logger.error(`Failed to create directory: ${directory}`, error.stack);
                throw new InternalServerErrorException('Could not create storage directory.');
            }
        }
    }

    async saveFile(fileObject: Express.Multer.File): Promise<LocalFileUploadResponse> {
        try {
            const uniqueSuffix = `${uuidv4()}${path.extname(fileObject.originalname)}`;
            const fileName = `${Date.now()}-${uniqueSuffix}`;
            const fullPath = path.join(this.uploadPath, fileName);
            // Construct the relative URL path by joining the baseUrl and the fileName
            const filePath = path.join(this.baseUrl, fileName).replace(/\\/g, '/'); // Ensure forward slashes for URL

            await fs.promises.writeFile(fullPath, fileObject.buffer);

            this.logger.log(`Saved file: ${fileName} to ${fullPath}`);
            return { fileName, filePath, fullPath };
        } catch (error) {
            this.logger.error(`Failed to save file: ${fileObject.originalname}`, error.stack);
            throw new InternalServerErrorException(`Failed to save file: ${error.message}`);
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

        return null; // Validation passed
    }

    async deleteFile(filePath: string): Promise<boolean> {
        // filePath here is expected to be the relative URL path like /static/uploads/products/filename.jpg
        // We need to convert it back to the absolute file system path.
        const fileName = path.basename(filePath);
        const fullPath = path.join(this.uploadPath, fileName);

        try {
            if (fs.existsSync(fullPath)) {
                await fs.promises.unlink(fullPath);
                this.logger.log(`Deleted file: ${fullPath}`);
                return true;
            } else {
                this.logger.warn(`File not found for deletion: ${fullPath}`);
                return false; // Or throw an error if preferred
            }
        } catch (error) {
            this.logger.error(`Failed to delete file: ${fullPath}`, error.stack);
            throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
        }
    }

    // Optional: Helper to get the full URL if needed, assuming API base URL is known
    // getFileUrl(filePath: string): string {
    //     const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000'; // Example
    //     return `${apiBaseUrl}${filePath}`;
    // }
}
