# Code Comment Style Guide

## Use English for Code Comments

All code comments should be in English for international collaboration and maintainability.

### Good Examples

```javascript
// Validate email format using regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Fetch user profile from API
 * @param {string} userId - The user ID
 * @returns {Promise<User>} User profile object
 */
async function getUserProfile(userId) {
  // Retry on network error
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await http.get(`/users/${userId}`);
    } catch (error) {
      if (attempt === 2) throw error; // Last attempt failed
      await delay(1000 * (attempt + 1)); // Exponential backoff
    }
  }
}

// Remove old tokens that have expired
async function cleanupExpiredTokens() {
  await db.query(`DELETE FROM token_blacklist WHERE expires_at <= NOW()`);
}
```

### Bad Examples

```javascript
// ❌ Vietnamese comments
// Kiểm tra email hợp lệ
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ❌ Vague comments
// do stuff
function processData() { }

// ❌ Comments that just repeat the code
// Set user to null
user = null;
```

## When to Comment

- **Complex logic**: Algorithm, regex, business rules
- **Why decisions**: Explain non-obvious design choices
- **Workarounds**: Document temporary solutions with FIXME/TODO
- **API integration**: Document external service expectations

## When NOT to Comment

- Self-explanatory variable/function names don't need comments
- Simple operations (assignments, loops, conditionals)
- Obvious conditions

## JSDoc Format

```javascript
/**
 * Create a new song and validate metadata
 * @param {Object} params
 * @param {string} params.title - Song title
 * @param {string} params.audioUrl - URL to audio file on Cloudinary
 * @param {number} [params.duration] - Duration in seconds (optional)
 * @returns {Promise<Song>} Created song object
 * @throws {ApiError} If validation fails or duplicate detected
 */
export async function createSong({ title, audioUrl, duration }) {
  // Implementation
}
```

## TODO/FIXME Format

```javascript
// TODO: Implement caching for expensive queries
// FIXME: Memory leak when subscribing to store without unsubscribe
// NOTE: This workaround is needed due to browser bug in Safari < 15
```

## Git Commit Messages

Also use English in commit messages:

```
✓ Good
feat: add duplicate audio detection with SHA256 hash
fix: correct CORS configuration to prevent CSRF
docs: document API versioning strategy
chore: update dependencies

✗ Bad
fix: sửa lỗi
Add more features
update code
```

## Best Practices

1. **Write comments AS YOU CODE** - Easier to explain while fresh in mind
2. **Keep comments updated** - Stale comments are worse than no comments
3. **Be specific** - Reference issues, PRs, or specific lines
4. **Use professional tone** - Treat comments like documentation
5. **Don't comment obvious code** - Let clear variable names do the talking

Example of clear naming eliminating need for comments:

```javascript
// ❌ Bad - needs comment to understand
const a = 1; // days until password expires

// ✓ Good - clear naming, no comment needed
const daysUntilPasswordExpires = 1;
```
