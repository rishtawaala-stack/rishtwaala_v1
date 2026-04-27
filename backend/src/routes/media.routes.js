const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { createResourceController } = require("../controllers/resource.controller");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js"); // Use local client to ensure service role
const env = require("../config/env");
const { v4: uuidv4 } = require("uuid");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/api-error");
const db = require("../services/supabase.service");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Use a dedicated service-role client for storage to bypass RLS reliably
const storageClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

router.post("/upload", authMiddleware, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, "VALIDATION_ERROR", "No file provided"));
    }

    const { type = 'media' } = req.query; // 'profile' or 'media'
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${req.auth.userId}/${uuidv4()}.${fileExt}`;

    console.log(`Uploading ${fileName} as Service Role...`);

    const { data, error } = await storageClient.storage
      .from("media")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      console.error("Storage upload error:", error);
      if (error.message.includes("Bucket not found")) {
         await storageClient.storage.createBucket('media', { public: true });
         const retry = await storageClient.storage.from("media").upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
         if(retry.error) return next(new ApiError(500, "SERVER_ERROR", "Failed to upload file to storage after bucket creation"));
      } else {
        return next(new ApiError(500, "SERVER_ERROR", "Failed to upload file: " + error.message));
      }
    }

    const { data: { publicUrl } } = storageClient.storage.from("media").getPublicUrl(fileName);

    // If it's a profile photo, update the user_information table
    if (type === 'profile') {
        const { error: updateError } = await db
            .from("user_information")
            .update({ profile_photo_url: publicUrl })
            .eq("user_id", req.auth.userId);
            
        if (updateError) console.error("Profile photo update error:", updateError);
    }

    return sendSuccess(res, { 
        url: publicUrl,
        fileName: fileName,
        path: data?.path
    }, {}, 201);
  } catch (err) {
    console.error("Upload route error:", err);
    return next(new ApiError(500, "SERVER_ERROR", "File upload failed: " + err.message));
  }
});

router.post("/upload-url", authMiddleware, createResourceController("media").create);
router.post("/", authMiddleware, createResourceController("media").create);
router.patch("/:mediaId", authMiddleware, createResourceController("media").update);
router.delete("/:mediaId", authMiddleware, createResourceController("media").remove);

module.exports = router;
