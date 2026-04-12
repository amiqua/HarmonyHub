# API Versioning Strategy

## Current Version
- **Latest**: v1 (prefix: `/api/v1/`)
- **Stability**: Stable
- **Sunset Date**: TBD

## Versioning Policy

### When to Create a New Version
1. Breaking changes to request/response format
2. Endpoint removal or major functionality change
3. Required field addition/modification
4. Response format changes

### When NOT to Create a New Version
- Adding optional fields
- Adding new endpoints
- Bug fixes
- Performance improvements
- Adding optional query parameters

## Backwards Compatibility

### HTTP Headers
All responses include version information:
```
X-API-Version: v1
X-API-Deprecated: false
X-API-Sunset: 2025-12-31
```

### Deprecation Headers
When an endpoint is being deprecated (typically 6 months notice):
```
Deprecation: true
Sunset: Sun, 31 Dec 2025 23:59:59 GMT
Link: </api/v2/endpoint>; rel="successor-version"
```

## Migration Guide

### v1 → v2 (Future)
When v2 is released, v1 will be maintained with:
- Bug fixes only
- 12-month grace period
- Security patches continue

Both versions can coexist:
```
GET /api/v1/songs   (legacy)
GET /api/v2/songs   (new)
```

## Implementation Notes

### Current Route Structure
```
/api/v1/auth       - Authentication endpoints
/api/v1/users      - User management
/api/v1/songs      - Song operations
/api/v1/playlists  - Playlist management
/api/v1/favorites  - Favorites management
/api/v1/history    - Play history
/api/v1/uploads    - File uploads
```

### Future v2 Structure (Proposed)
```
/api/v2/auth       - Auth with OAuth2/OIDC support
/api/v2/users      - Enhanced user profiles
/api/v2/library    - Combined songs/albums/playlists
/api/v2/playback   - Streaming and analytics
/api/v2/social     - Social features
/api/v2/admin      - Admin operations
```

## Request/Response Format

All endpoints follow consistent format:

### Success Response (v1)
```json
{
  "success": true,
  "data": { /* actual data */ },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response (v1)
```json
{
  "success": false,
  "message": "User-friendly error message",
  "payload": null
}
```

## Testing

All API endpoints should have version-specific tests:
- Unit tests
- Integration tests
- Backwards compatibility tests (when multiple versions exist)

## Documentation

Maintain separate docs for each version:
- `/docs/v1/` - Current stable version
- `/docs/v2/` - Development/beta versions
- `/docs/api-changelog.md` - Breaking changes log
