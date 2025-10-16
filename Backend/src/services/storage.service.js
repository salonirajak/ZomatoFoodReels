const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

module.exports = {
    async uploadFile(buffer, filename) {
        try {
            // Validate inputs
            if (!buffer) {
                throw new Error('No file buffer provided');
            }
            if (!filename) {
                throw new Error('No filename provided');
            }
            
            // Preserve original file extension or use .mp4 as default
            let finalFilename = filename;
            if (!path.extname(filename)) {
                finalFilename = filename + '.mp4';
            }
            
            // Save the file to disk
            const filePath = path.join(uploadsDir, finalFilename);
            console.log(`Saving file to: ${filePath}`);
            console.log(`File buffer size: ${buffer.length} bytes`);
            
            // Write file with better error handling
            try {
                await fs.promises.writeFile(filePath, buffer);
            } catch (writeError) {
                console.error('Error writing file to disk:', writeError);
                throw new Error(`Failed to write file to disk: ${writeError.message}`);
            }
            
            // Verify file was saved
            let stats = null;
            try {
                stats = fs.statSync(filePath);
                console.log(`File saved successfully. Size: ${stats.size} bytes`);
            } catch (statError) {
                console.error('Error getting file stats:', statError);
                throw new Error(`Failed to verify saved file: ${statError.message}`);
            }
            
            // Return the URL where the file can be accessed
            const url = `/uploads/${finalFilename}`;
            console.log(`File URL: ${url}`);
            return { url, path: filePath, size: stats.size };
        } catch (error) {
            console.error('Error in uploadFile service:', error);
            throw new Error(`File upload failed: ${error.message}`);
        }
    }
};