import express from "express";
import songController from "../module/song/song.controller.js";

const router = express.Router();

// API tạo bài hát (DB chỉ lưu link audio)
router.post("/", songController.createSong);

export default router;
