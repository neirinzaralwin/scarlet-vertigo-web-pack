export const configs = {
    fileUpload: {
        scopes: ['https://www.googleapis.com/auth/drive'],
        minFileSize: 0.001 * 1024 * 1024, // 0.001 MB
        maxFileSize: 5 * 1024 * 1024, // 5 MB
        imageMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        credentialFileName: 'google-cloud-console-service-key.json',
    },
};
