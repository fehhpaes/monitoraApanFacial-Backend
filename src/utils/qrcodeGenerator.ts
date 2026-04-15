import QRCode from 'qrcode';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

export const generateQRCodeForStudent = async (studentData: {
  _id: string;
  nome: string;
  curso: string;
  fotoUrl: string;
  emailResponsavel: string;
}) => {
  try {
    // Criar dados do QR Code em JSON
    const qrData = JSON.stringify({
      _id: studentData._id,
      nome: studentData.nome,
      curso: studentData.curso,
      fotoUrl: studentData.fotoUrl,
      emailResponsavel: studentData.emailResponsavel,
      geradoEm: new Date().toISOString(),
    });

    // Gerar QR Code como PNG em buffer
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
    });

    // Upload para Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'monitoraapan/qrcodes',
          public_id: `qrcode_${studentData._id}`,
          overwrite: true,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              qrCodeUrl: result?.secure_url,
              qrCodePublicId: result?.public_id,
            });
          }
        }
      );

      // Converter buffer para stream
      const bufferStream = new Readable();
      bufferStream.push(qrCodeBuffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw error;
  }
};

export const deleteQRCode = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Erro ao deletar QR Code:', error);
    throw error;
  }
};
