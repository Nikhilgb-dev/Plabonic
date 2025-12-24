import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Multer setup: keep files in memory so we can stream to Cloudinary
const storage = multer.memoryStorage();

// Support all common files (pdf, doc, images, etc.) with a reasonable default size limit
const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_MB || 20) * 1024 * 1024, // default 20MB
  },
});

/**
 * Stream a Multer file to Cloudinary.
 * resource_type: "auto" lets Cloudinary accept images, pdf, docx and other common files.
 * Returns the secure URL of the uploaded asset.
 */
export const uploadToCloudinary = (file, folder = "uploads") =>
  new Promise((resolve, reject) => {
    if (!file) return resolve("");

    const originalName = file.originalname || file.path || "upload";
    const isImage = (file.mimetype || "").startsWith("image/");
    const parsed = path.parse(originalName);

    const getFormatFromMime = (mime = "") => {
      const map = {
        "application/pdf": "pdf",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          "docx",
        "application/vnd.ms-powerpoint": "ppt",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          "pptx",
        "application/vnd.ms-excel": "xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          "xlsx",
      };
      if (map[mime]) return map[mime];
      if (mime.startsWith("image/")) return mime.split("/")[1];
      if (mime.includes("pdf")) return "pdf";
      if (mime.includes("word")) return "docx";
      return undefined;
    };

    const ext = parsed.ext
      ? parsed.ext.replace(".", "").toLowerCase()
      : undefined;
    const format = getFormatFromMime(file.mimetype) || ext || undefined;
    const resourceType = isImage ? "image" : "raw";

    const options = {
      folder,
      resource_type: resourceType,
      downloadable: true,
      public_id: parsed.name,
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      access_mode: "public",
      type: "upload",
      invalidate: true,
    };

    // Only send format if we actually derived one; Cloudinary will set content-type
    if (format) options.format = format;
    if (!isImage) {
      options.resource_type = "raw";
      if (file.mimetype) options.content_type = file.mimetype;
      if (!format && ext === "pdf") options.format = "pdf"; // ensure pdf extension
    }

    const done = (err, result) => {
      if (err || !result) return reject(err || new Error("Upload failed"));
      const url = result.secure_url;
      // Debug log for tracing uploads
      // console.log("[cloudinary] uploaded", originalName, "->", url, {
      //   resourceType: result.resource_type,
      //   format: result.format,
      //   type: result.type,
      //   accessMode: result.access_mode,
      //   bytes: result.bytes,
      //   contentType: result.content_type,
      // });
      return resolve(url);
    };

    const stream = cloudinary.uploader.upload_stream(options, done);

    if (file.buffer) {
      stream.end(file.buffer);
    } else if (file.path) {
      fs.createReadStream(file.path).pipe(stream);
    } else {
      reject(new Error("No file data to upload"));
    }
  });

export { upload, cloudinary };
