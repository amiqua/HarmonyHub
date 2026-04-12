import { db } from "../../config/db.js";
import { cloudinary, ensureCloudinaryConfigured } from "../../config/cloudinary.js";
import { logger } from "../../config/logger.js";

const CLEANUP_QUEUE_TABLE = "file_cleanup_queue";

export async function initCleanupQueue() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS ${CLEANUP_QUEUE_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        public_id TEXT NOT NULL,
        resource_type VARCHAR(50) DEFAULT 'video',
        retry_count INT DEFAULT 0,
        max_retries INT DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        next_retry_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    logger.warn("Failed to init cleanup queue table", err);
  }
}

export async function queueFileForDeletion(publicId, resourceType = "video") {
  try {
    await db.query(
      `INSERT INTO ${CLEANUP_QUEUE_TABLE} (public_id, resource_type)
       VALUES ($1, $2)
       ON CONFLICT (public_id) DO NOTHING;`,
      [publicId, resourceType]
    );
  } catch (err) {
    logger.error("Failed to queue file for deletion", err);
  }
}

export async function processCleanupQueue() {
  try {
    ensureCloudinaryConfigured();

    const result = await db.query(
      `SELECT id, public_id, resource_type, retry_count, max_retries
       FROM ${CLEANUP_QUEUE_TABLE}
       WHERE retry_count < max_retries
       AND next_retry_at <= NOW()
       ORDER BY created_at ASC
       LIMIT 10;`
    );

    for (const item of result.rows) {
      try {
        await cloudinary.uploader.destroy(item.public_id, {
          resource_type: item.resource_type,
        });

        // Deletion successful, remove from queue
        await db.query(
          `DELETE FROM ${CLEANUP_QUEUE_TABLE} WHERE id = $1;`,
          [item.id]
        );

        logger.info(`Cleaned up Cloudinary file: ${item.public_id}`);
      } catch (err) {
        const nextRetryAt = new Date(Date.now() + (5 * 60 * 1000)); // 5 min delay
        await db.query(
          `UPDATE ${CLEANUP_QUEUE_TABLE}
           SET retry_count = retry_count + 1,
               next_retry_at = $1
           WHERE id = $2;`,
          [nextRetryAt, item.id]
        );

        logger.warn(`Failed to delete ${item.public_id}, will retry`, err);
      }
    }
  } catch (err) {
    logger.error("Error processing cleanup queue", err);
  }
}

// Run cleanup every 10 minutes
export function startCleanupScheduler() {
  setInterval(processCleanupQueue, 10 * 60 * 1000);
}
