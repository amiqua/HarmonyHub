/**
 * Song download functionality
 * Provides stream download of audio files
 */

import { http } from "./http";

export async function downloadSong(songId, songTitle) {
  try {
    const response = await http.get(`/songs/${songId}/download`, {
      responseType: "blob",
    });

    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${songTitle || "song"}.mp3`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}

/**
 * Backend endpoint for downloading songs
 * This should be added to the songs router
 */
export const downloadSongEndpoint = `
export async function download(req, res) {
  const { id } = req.params;

  try {
    const song = await songsRepo.getById(id);
    if (!song) throw new ApiError(404, "Không tìm thấy bài hát");

    // Verify user has access (if needed)
    // For public songs, skip auth check

    // Stream the file from Cloudinary or direct URL
    const response = await axios({
      method: "get",
      url: song.audio_url,
      responseType: "stream",
    });

    // Set headers
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", \`attachment; filename="\${song.title}.mp3"\`);

    // Pipe the stream to response
    response.data.pipe(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, "Lỗi tải file");
  }
}

// In songs.routes.js:
// router.get("/:id/download", download);
`;
