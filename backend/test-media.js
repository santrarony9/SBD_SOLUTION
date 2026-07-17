const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { MediaService } = require('./dist/media/media.service');
const fs = require('fs/promises');
const path = require('path');

async function testUpload() {
  console.log('Starting upload test...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const mediaService = app.get(MediaService);
  
  const testBuffer = Buffer.from('hello world this is a test file');
  
  try {
    const result = await mediaService.uploadBuffer(testBuffer, 'test_folder');
    console.log('Upload Result:', result);
    
    // Check if file exists
    const filePath = path.join(process.cwd(), 'uploads', 'test_folder', result.public_id);
    const stat = await fs.stat(filePath);
    console.log('File created successfully, size:', stat.size);
    
    // Cleanup
    await fs.unlink(filePath);
    await fs.rmdir(path.join(process.cwd(), 'uploads', 'test_folder'));
    console.log('Cleanup successful');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await app.close();
  }
}

testUpload();
