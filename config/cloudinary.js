

import cloudinary from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Function to upload a file to Cloudinary and return the secure URL
export const uploadToCloudinary = async (fileBuffer) => {
  try {
    const result = await cloudinary.v2.uploader.upload_stream(
      { folder: 'user-verification' }, // Folder name on Cloudinary
      (error, result) => {
        if (error) {
          throw new Error('Error uploading to Cloudinary: ' + error.message);
        }
        return result.secure_url; // Return the secure URL of the uploaded file
      }
    );
    
    // Create a stream and pipe the buffer to Cloudinary
    const stream = cloudinary.v2.uploader.upload_stream({ folder: 'user-verification' });
    stream.end(fileBuffer);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message);
  }
};
