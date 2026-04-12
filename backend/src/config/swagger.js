/**
 * OpenAPI 3.0 Documentation for HarmonyHub API
 * 
 * This is a Swagger/OpenAPI spec that documents the entire API.
 * Can be viewed at /api-docs when swagger-ui-express is configured.
 */

export const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "HarmonyHub API",
    version: "1.0.0",
    description: "Music streaming platform API with authentication, songs management, playlists, and more.",
    contact: {
      name: "HarmonyHub Team",
      email: "support@harmonyhub.dev",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api/v1",
      description: "Development server",
    },
    {
      url: "https://api.harmonyhub.dev/api/v1",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Access Token",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          username: { type: "string" },
          email: { type: "string", format: "email" },
          avatar_url: { type: "string", nullable: true },
          bio: { type: "string", nullable: true },
          role: { type: "string", enum: ["USER", "ADMIN", "MOD"] },
          is_active: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Song: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          artist: { type: "string" },
          audio_url: { type: "string" },
          audio_hash: { type: "string", nullable: true },
          cover_url: { type: "string", nullable: true },
          duration: { type: "integer", description: "Duration in seconds" },
          bit_rate: { type: "integer", nullable: true },
          codec: { type: "string", nullable: true },
          release_date: { type: "string", format: "date", nullable: true },
          user_id: { type: "string", format: "uuid", nullable: true },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Playlist: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          type: { type: "string", enum: ["user", "system"] },
          cover_url: { type: "string", nullable: true },
          user_id: { type: "string", format: "uuid" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      PaginatedResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: { type: "array" },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          payload: { type: "object", nullable: true },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password"],
                properties: {
                  username: { type: "string", minLength: 3, maxLength: 50 },
                  email: { type: "string", format: "email" },
                  password: {
                    type: "string",
                    minLength: 8,
                    description: "Must contain uppercase, lowercase, number, and special character",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        tokens: {
                          type: "object",
                          properties: {
                            accessToken: { type: "string" },
                            refreshToken: { type: "string", nullable: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Validation error" },
          409: { description: "User already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Logout user and revoke token",
        tags: ["Authentication"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Logout successful" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Get current user profile",
        tags: ["Authentication"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User profile retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/songs": {
      get: {
        summary: "List all songs with pagination",
        tags: ["Songs"],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "q", in: "query", schema: { type: "string" }, description: "Search by title or artist" },
          { name: "sort", in: "query", schema: { type: "string", enum: ["newest", "oldest", "title_asc", "title_desc"] } },
        ],
        responses: {
          200: {
            description: "Songs list retrieved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedResponse" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new song (requires upload)",
        tags: ["Songs"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "audio"],
                properties: {
                  title: { type: "string" },
                  audio: { type: "string", format: "binary", description: "Audio file (mp3, wav, flac, etc)" },
                  image: { type: "string", format: "binary", description: "Cover image (jpg, png, webp)" },
                  release_date: { type: "string", format: "date" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Song created" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          409: { description: "Duplicate song" },
        },
      },
    },
    "/songs/{id}": {
      get: {
        summary: "Get song by ID",
        tags: ["Songs"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "Song retrieved" },
          404: { description: "Song not found" },
        },
      },
      put: {
        summary: "Update song",
        tags: ["Songs"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "Song updated" },
          403: { description: "Not owner of song" },
          404: { description: "Song not found" },
        },
      },
      delete: {
        summary: "Delete song",
        tags: ["Songs"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "Song deleted" },
          403: { description: "Not owner of song" },
          404: { description: "Song not found" },
        },
      },
    },
  },
  security: [],
};
