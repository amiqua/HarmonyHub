/**
 * i18n (Internationalization) support for backend
 * Provides multilingual error messages based on Accept-Language header
 */

const translations = {
  vi: {
    "validation.email_invalid": "Email không hợp lệ",
    "validation.password_too_short": "Password tối thiểu 8 ký tự",
    "validation.password_weak": "Password phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt",
    "validation.username_short": "Username tối thiểu 3 ký tự",
    "auth.unauthorized": "Bạn cần đăng nhập",
    "auth.invalid_token": "Token không hợp lệ hoặc đã hết hạn",
    "auth.token_revoked": "Token đã bị thu hồi. Vui lòng đăng nhập lại",
    "auth.invalid_credentials": "Email hoặc mật khẩu không đúng",
    "auth.user_not_found": "Tài khoản không tồn tại",
    "auth.user_already_exists": "Email đã tồn tại",
    "auth.username_taken": "Username đã tồn tại",
    "auth.logout_success": "Đã đăng xuất thành công",
    "songs.not_found": "Không tìm thấy bài hát",
    "songs.duplicate": "Bài hát này đã tồn tại trong thư viện",
    "songs.invalid_audio_format": "Định dạng audio không được hỗ trợ",
    "songs.invalid_audio_duration": "Độ dài audio không hợp lệ",
    "songs.file_too_large": "File quá lớn (tối đa 100MB)",
    "songs.forbidden": "Bạn không có quyền thao tác bài hát này",
    "playlists.not_found": "Không tìm thấy playlist",
    "error.internal": "Lỗi hệ thống, vui lòng thử lại sau",
    "error.database": "Lỗi xử lý dữ liệu, vui lòng thử lại sau",
  },
  en: {
    "validation.email_invalid": "Invalid email address",
    "validation.password_too_short": "Password must be at least 8 characters",
    "validation.password_weak": "Password must contain uppercase, lowercase, number and special character",
    "validation.username_short": "Username must be at least 3 characters",
    "auth.unauthorized": "Authentication required",
    "auth.invalid_token": "Invalid or expired token",
    "auth.token_revoked": "Token has been revoked. Please login again",
    "auth.invalid_credentials": "Invalid email or password",
    "auth.user_not_found": "User not found",
    "auth.user_already_exists": "Email already exists",
    "auth.username_taken": "Username already taken",
    "auth.logout_success": "Logged out successfully",
    "songs.not_found": "Song not found",
    "songs.duplicate": "This song already exists in your library",
    "songs.invalid_audio_format": "Audio format not supported",
    "songs.invalid_audio_duration": "Invalid audio duration",
    "songs.file_too_large": "File too large (maximum 100MB)",
    "songs.forbidden": "You don't have permission to edit this song",
    "playlists.not_found": "Playlist not found",
    "error.internal": "System error, please try again later",
    "error.database": "Database error, please try again later",
  },
};

/**
 * Get user's preferred language from Accept-Language header
 * Falls back to Vietnamese if not specified
 */
export function getLanguageFromHeader(acceptLanguage) {
  if (!acceptLanguage) return "vi";

  const preferred = acceptLanguage.split(",")[0].split("-")[0].toLowerCase();
  return ["vi", "en"].includes(preferred) ? preferred : "vi";
}

/**
 * Get translated message
 */
export function t(key, lang = "vi") {
  return translations[lang]?.[key] || translations["en"]?.[key] || key;
}

/**
 * Middleware to attach language to request
 */
export function i18nMiddleware(req, res, next) {
  req.language = getLanguageFromHeader(req.headers["accept-language"]);
  req.t = (key) => t(key, req.language);
  next();
}

/**
 * Get all available translations for export
 */
export function getTranslations() {
  return translations;
}
