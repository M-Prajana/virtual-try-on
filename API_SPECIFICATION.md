# Virtual Try-On Application - API Specification

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication
All protected endpoints require authentication via NextAuth.js session cookies.

---

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "clx123abc",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

#### POST /api/auth/login
Login with email and password (handled by NextAuth.js).

---

#### POST /api/auth/logout
Logout current user (handled by NextAuth.js).

---

### Image Upload

#### POST /api/upload/body
Upload a body image.

**Headers:**
```
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
image: File (JPEG, PNG, WebP, max 10MB)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx456def",
    "imageUrl": "https://res.cloudinary.com/...",
    "cloudinaryId": "body_images/abc123",
    "metadata": {
      "width": 1024,
      "height": 1536,
      "format": "jpeg",
      "size": 2048576
    },
    "createdAt": "2026-05-09T09:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid file format. Only JPEG, PNG, and WebP are allowed."
}
```

---

#### POST /api/upload/garment
Upload a garment image.

**Headers:**
```
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
image: File (JPEG, PNG, WebP, max 10MB)
category: string (optional: "shirt", "dress", "pants", etc.)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx789ghi",
    "imageUrl": "https://res.cloudinary.com/...",
    "cloudinaryId": "garment_images/def456",
    "category": "dress",
    "metadata": {
      "width": 800,
      "height": 1200,
      "format": "png",
      "size": 1536000
    },
    "createdAt": "2026-05-09T09:05:00.000Z"
  }
}
```

---

#### GET /api/upload/body
Get all body images for the current user.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx456def",
      "imageUrl": "https://res.cloudinary.com/...",
      "createdAt": "2026-05-09T09:00:00.000Z"
    }
  ]
}
```

---

#### GET /api/upload/garment
Get all garment images for the current user.

**Query Parameters:**
- `category` (optional): Filter by category

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx789ghi",
      "imageUrl": "https://res.cloudinary.com/...",
      "category": "dress",
      "createdAt": "2026-05-09T09:05:00.000Z"
    }
  ]
}
```

---

#### DELETE /api/upload/:type/:id
Delete an uploaded image.

**Parameters:**
- `type`: "body" or "garment"
- `id`: Image ID

**Response (200):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

### Try-On Processing

#### POST /api/try-on
Create a new try-on request.

**Request Body:**
```json
{
  "bodyImageId": "clx456def",
  "garmentImageId": "clx789ghi"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clx999jkl",
    "status": "pending",
    "bodyImageId": "clx456def",
    "garmentImageId": "clx789ghi",
    "createdAt": "2026-05-09T09:10:00.000Z",
    "estimatedTime": 30
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid body image ID"
}
```

---

#### GET /api/try-on/:id
Get try-on result by ID.

**Response (200) - Processing:**
```json
{
  "success": true,
  "data": {
    "id": "clx999jkl",
    "status": "processing",
    "progress": 45,
    "bodyImageId": "clx456def",
    "garmentImageId": "clx789ghi",
    "createdAt": "2026-05-09T09:10:00.000Z"
  }
}
```

**Response (200) - Completed:**
```json
{
  "success": true,
  "data": {
    "id": "clx999jkl",
    "status": "completed",
    "resultUrl": "https://res.cloudinary.com/...",
    "modelUsed": "huggingface",
    "bodyImageId": "clx456def",
    "garmentImageId": "clx789ghi",
    "isFavorite": false,
    "createdAt": "2026-05-09T09:10:00.000Z",
    "processingMetadata": {
      "processingTime": 28.5,
      "modelVersion": "1.0"
    }
  }
}
```

**Response (200) - Failed:**
```json
{
  "success": true,
  "data": {
    "id": "clx999jkl",
    "status": "failed",
    "error": "Model processing failed",
    "createdAt": "2026-05-09T09:10:00.000Z"
  }
}
```

---

#### GET /api/try-on
Get all try-on results for the current user.

**Query Parameters:**
- `status` (optional): Filter by status ("pending", "processing", "completed", "failed")
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx999jkl",
      "status": "completed",
      "resultUrl": "https://res.cloudinary.com/...",
      "bodyImage": {
        "id": "clx456def",
        "imageUrl": "https://res.cloudinary.com/..."
      },
      "garmentImage": {
        "id": "clx789ghi",
        "imageUrl": "https://res.cloudinary.com/..."
      },
      "isFavorite": false,
      "createdAt": "2026-05-09T09:10:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

---

#### DELETE /api/try-on/:id
Delete a try-on result.

**Response (200):**
```json
{
  "success": true,
  "message": "Try-on result deleted successfully"
}
```

---

### Favorites

#### POST /api/favorites/:id
Add a try-on result to favorites.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx999jkl",
    "isFavorite": true
  }
}
```

---

#### DELETE /api/favorites/:id
Remove a try-on result from favorites.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx999jkl",
    "isFavorite": false
  }
}
```

---

#### GET /api/favorites
Get all favorite try-on results.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx999jkl",
      "resultUrl": "https://res.cloudinary.com/...",
      "bodyImage": {
        "imageUrl": "https://res.cloudinary.com/..."
      },
      "garmentImage": {
        "imageUrl": "https://res.cloudinary.com/..."
      },
      "createdAt": "2026-05-09T09:10:00.000Z"
    }
  ]
}
```

---

### User Dashboard

#### GET /api/dashboard/stats
Get user statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTryOns": 25,
    "completedTryOns": 23,
    "failedTryOns": 2,
    "favorites": 8,
    "bodyImages": 5,
    "garmentImages": 12,
    "recentActivity": [
      {
        "id": "clx999jkl",
        "type": "try-on",
        "status": "completed",
        "createdAt": "2026-05-09T09:10:00.000Z"
      }
    ]
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 413 | Payload Too Large - File size exceeds limit |
| 415 | Unsupported Media Type - Invalid file format |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - ML service unavailable |

---

## Rate Limiting

- **Anonymous users**: 10 requests per hour
- **Authenticated users**: 100 requests per hour
- **Try-on processing**: 5 concurrent requests per user

---

## ML Service Integration

### Mock Service (Development)
```typescript
// Returns a placeholder image after 2-3 seconds
// Used when USE_MOCK_ML=true
```

### Hugging Face API (Primary)
```typescript
// Endpoint: https://api-inference.huggingface.co/models/yisol/IDM-VTON
// Headers: Authorization: Bearer {HUGGINGFACE_API_KEY}
// Rate Limit: Free tier limits apply
// Fallback: If rate limited or error, try Replicate
```

### Replicate API (Fallback)
```typescript
// Endpoint: https://api.replicate.com/v1/predictions
// Headers: Authorization: Token {REPLICATE_API_TOKEN}
// Rate Limit: Free tier credits apply
// Fallback: If unavailable, return error
```

---

## WebSocket Events (Future Enhancement)

For real-time try-on status updates:

```typescript
// Connect
ws://localhost:3000/api/ws

// Events
{
  "event": "try-on:status",
  "data": {
    "id": "clx999jkl",
    "status": "processing",
    "progress": 45
  }
}

{
  "event": "try-on:completed",
  "data": {
    "id": "clx999jkl",
    "resultUrl": "https://..."
  }
}

{
  "event": "try-on:failed",
  "data": {
    "id": "clx999jkl",
    "error": "Processing failed"
  }
}
```

---

## Testing

### Example cURL Commands

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

**Upload Body Image:**
```bash
curl -X POST http://localhost:3000/api/upload/body \
  -H "Cookie: next-auth.session-token=..." \
  -F "image=@/path/to/body.jpg"
```

**Create Try-On:**
```bash
curl -X POST http://localhost:3000/api/try-on \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"bodyImageId":"clx456def","garmentImageId":"clx789ghi"}'
```

**Get Try-On Status:**
```bash
curl -X GET http://localhost:3000/api/try-on/clx999jkl \
  -H "Cookie: next-auth.session-token=..."
```

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. Image URLs are CDN-optimized Cloudinary URLs
3. File uploads use multipart/form-data
4. Authentication uses HTTP-only cookies
5. All responses include `success` boolean field
6. Error responses include descriptive `error` field
