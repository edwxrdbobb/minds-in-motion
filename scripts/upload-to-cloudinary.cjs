const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: "dkmwom4df",
  api_key: "246146779672568",
  api_secret: "U9SDzc7SztB9NdkGXuqAJtnHtdo",
});

const publicDir = path.resolve(__dirname, "..", "public");
const imageExtensions = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".tiff",
]);
const videoExtensions = new Set([
  ".mp4", ".mov", ".avi", ".webm", ".mkv",
]);
const bannedPrefixes = [".", "icon-", "apple-icon"];

async function uploadFile(filePath, relativePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isVideo = videoExtensions.has(ext);
  const isImage = imageExtensions.has(ext);
  if (!isImage && !isVideo) return null;

  const publicId = relativePath
    .replace(/\\/g, "/")
    .replace(/\.[^.]+$/, "")
    .replace(/\.\./g, "_");

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      resource_type: isVideo ? "video" : "image",
      overwrite: true,
    });
    return { publicId, url: result.secure_url, file: relativePath };
  } catch (err) {
    console.error(`Failed to upload ${filePath}: ${err.message}`);
    return null;
  }
}

async function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(publicDir, fullPath);
    if (entry.isDirectory()) {
      if (entry.name.startsWith(".")) continue;
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      if (bannedPrefixes.some((p) => entry.name.startsWith(p))) {
        console.log(`Skipping ${entry.name} (banned prefix)`);
        continue;
      }
      files.push({ fullPath, relativePath });
    }
  }
  return files;
}

(async () => {
  console.log("Scanning public folder...");
  const files = await walk(publicDir);
  console.log(`Found ${files.length} files to process.`);

  const results = [];
  for (const { fullPath, relativePath } of files) {
    const result = await uploadFile(fullPath, relativePath);
    if (result) {
      results.push(result);
      console.log(`Uploaded: ${result.file} -> ${result.url}`);
    }
  }

  const outputPath = path.resolve(__dirname, "..", "cloudinary-urls.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nDone! ${results.length} files uploaded.`);
  console.log(`URL mapping saved to: ${outputPath}`);
})();
