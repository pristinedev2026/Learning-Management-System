import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadsService {
  saveFile(file: Express.Multer.File) {
    // In a real app, you might want to rename the file or use a library like UUID
    const fileName = `${Date.now()}-${file.originalname}`;
    return {
      url: `/uploads/${file.filename}`, // Multer handles the actual saving if configured in controller
      fileName: file.filename,
    };
  }

  deleteFile(fileUrl: string) {
    try {
      // Local files are served from /uploads/
      const parts = fileUrl.split('/uploads/');
      if (parts.length < 2) return; // Not a local upload or malformed

      const fileName = parts[1];
      const filePath = path.join(process.cwd(), 'uploads', fileName!);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old file: ${filePath}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}
