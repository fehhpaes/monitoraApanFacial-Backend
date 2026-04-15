import { v2 as cloudinary } from 'cloudinary';

export const configureCloudinary = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  
  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL not defined in environment variables');
  }

  cloudinary.config({
    secure: true,
  });

  // Parse the CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
  const url = new URL(cloudinaryUrl);
  cloudinary.config({
    cloud_name: url.hostname,
    api_key: url.username,
    api_secret: url.password,
    secure: true,
  });

  console.log('✅ Cloudinary configured successfully');
  return cloudinary;
};

export default cloudinary;
