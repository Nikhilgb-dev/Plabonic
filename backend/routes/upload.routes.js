import { Router } from "express";
import { upload, cloudinary } from "../utils/cloudinary.util.js";

const router = Router();

// console.log("cloudinary.config()", cloudinary.config());

function ensureImage(req, res, next) {
  const isImage = (req.file?.mimetype || "").startsWith("image/");
  if (!isImage)
    return res.status(400).json({ message: "Please upload an image file." });
  next();
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please choose a file to upload." });

    const tenantId =
      (req.tenant && String(req.tenant)) ||
      (req.user?.tenant && String(req.user.tenant)) ||
      (req.role?.tenant && String(req.role.tenant)) ||
      "public";

    const folder = `instaclass/homework/${tenantId}`;

    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto", // accept any file type (pdf, docx, images, etc.)
          use_filename: true,
          unique_filename: true,
          filename_override: req.file.originalname,
        },
        (err, file) => (err ? reject(err) : resolve(file))
      );
      stream.end(req.file.buffer);
    });

    // match your UI: const { data } = await res.json();
    return res.json({
      data: {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        filename: req.file.originalname || uploaded.original_filename,
        mimeType: req.file.mimetype || uploaded.resource_type,
        sizeBytes: req.file.size ?? undefined,
      },
    });
  } catch (err) {
    console.error("Generic upload failed:", err);
    return res.status(500).json({ message: "We couldn't upload the file. Please try again." });
  }
});

router.post("/student-photo", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please choose a file to upload." });

    // optional: folder per-tenant
    const folder = `instaclass/students/${req.tenant}`;
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 300, height: 300, crop: "fill", gravity: "face" },
          ],
        },
        (err, uploaded) => (err ? reject(err) : resolve(uploaded))
      );
      stream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (err) {
    res.status(500).json({ message: "We couldn't upload the file. Please try again." });
  }
});

router.post(
  "/teacher-photo",
  upload.single("file"),
  ensureImage,
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "Please choose a file to upload." });

      const tenantFolder = req.tenant ? String(req.tenant) : "public";
      const folder = `instaclass/teachers/${tenantFolder}`;

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [
              { width: 300, height: 300, crop: "fill", gravity: "face" },
            ],
          },
          (err, uploaded) => (err ? reject(err) : resolve(uploaded))
        );
        stream.end(req.file.buffer);
      });

      res.json({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      });
    } catch (err) {
      res.status(500).json({ message: "We couldn't upload the file. Please try again." });
    }
  }
);

export default router;

