import multer from 'multer';

// Set up memory storage for Multer
const storage = multer.memoryStorage(); // Files will be stored in memory

// Define file upload configuration (fields can be adjusted as needed)
const upload = multer({ storage }).fields([
  { name: 'pandoc', maxCount: 1 },
  { name: 'aadhaardoc', maxCount: 1 },
  { name: 'licensenumdoc', maxCount: 1 },
  { name: 'passportdoc', maxCount: 1 },
  { name: 'voterdoc', maxCount: 1 }
]);

export default upload;
