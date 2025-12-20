/**
 * Công dụng: Gom và mount toàn bộ router của dự án.
 * - /health: kiểm tra server/DB
 * - /api/v1/*: các API chính theo module
 * - /api/v1/uploads: API upload (audio lên Cloudinary)
 */

import { Router } from "express";
import healthRoutes from "./health.routes.js";
import uploadRoutes from "./upload.routes.js";

import authRoutes from "../modules/auth/auth.routes.js";
import usersRoutes from "../modules/users/users.routes.js";
import songsRoutes from "../modules/songs/songs.routes.js";
import artistsRoutes from "../modules/artists/artists.routes.js";
import albumsRoutes from "../modules/albums/albums.routes.js";
import genresRoutes from "../modules/genres/genres.routes.js";
import playlistsRoutes from "../modules/playlists/playlists.routes.js";
import favoritesRoutes from "../modules/favorites/favorites.routes.js";
import historyRoutes from "../modules/history/history.routes.js";

const router = Router();

/** Health check */
router.use("/health", healthRoutes);

/** Upload */
router.use("/api/v1/uploads", uploadRoutes);

/** API v1 */
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/users", usersRoutes);

router.use("/api/v1/songs", songsRoutes);
router.use("/api/v1/artists", artistsRoutes);
router.use("/api/v1/albums", albumsRoutes);
router.use("/api/v1/genres", genresRoutes);

router.use("/api/v1/playlists", playlistsRoutes);
router.use("/api/v1/favorites", favoritesRoutes);
router.use("/api/v1/history", historyRoutes);

export default router;
