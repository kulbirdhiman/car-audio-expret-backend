import multer, { FileFilterCallback } from "multer";
import multerS3 from "multer-s3";
import { Request } from "express";
import s3 from "../config/aws";
import path from "path";

const bucketName = process.env.S3_BUCKET!;

const upload = multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE, // ✅ Automatically sets correct Content-Type
    metadata: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, metadata?: any) => void
    ) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, key?: any) => void
    ) => {
      console.log(file.originalname);
      const folderFromReq = (_req.body.folder || _req.query.folder || "uploads").toString(); // default to 'uploads'
      const safeFolder = folderFromReq.replace(/[^a-zA-Z0-9-_]/g, ""); // sanitize folder name

      const safeFileName = path.basename(file.originalname).replace(/\s+/g, "-"); // Replace spaces with hyphens

      const fileName = `${safeFolder}/${Date.now()}_${safeFileName}`;
      console.log("fileName",fileName);
      
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "video/mp4"
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, WEBP, PDF, and MP4 are allowed."));
    }
  }
  
});

export default upload;
