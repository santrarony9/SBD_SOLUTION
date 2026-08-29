const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function uploadFile(filePath) {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    console.log(`Starting upload for ${filePath}...`);
    const startTime = Date.now();

    const response = await axios.post('http://160.187.68.243:3001/api/media/upload-local', form, {
      headers: {
        ...form.getHeaders()
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });

    const endTime = Date.now();
    console.log(`Upload completed in ${(endTime - startTime) / 1000}s`);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}

uploadFile('../video3.mp4');
