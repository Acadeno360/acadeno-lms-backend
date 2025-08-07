# File Upload System Documentation

## Overview

The Maitexa LMS backend includes a comprehensive, modular file upload system that supports multiple storage providers and upload types. This system is designed to be flexible, scalable, and secure.

## Features

### 🚀 Core Features
- **Multiple Storage Providers**: Local filesystem, Cloudinary, and AWS S3
- **Multiple Upload Types**: Single file, multiple files, and named field uploads
- **Image Optimization**: Automatic image resizing and optimization using Sharp
- **Thumbnail Generation**: Automatic thumbnail creation for images
- **File Validation**: Comprehensive file type and size validation
- **Security**: JWT authentication and role-based authorization
- **Error Handling**: Robust error handling and logging

### 📁 Upload Types
1. **Single File Upload**: Upload one file at a time
2. **Multiple Files Upload**: Upload multiple files simultaneously
3. **Named Files Upload**: Upload files with specific field names (profile, resume, certificate, assignment)
4. **Student-Specific Uploads**: Upload files for specific students
5. **Course Materials Upload**: Upload course-related files
6. **Trainer Profile Upload**: Upload trainer profile images

### ☁️ Storage Providers
1. **Local Storage**: Files stored on the server filesystem
2. **Cloudinary**: Cloud-based image and video management
3. **AWS S3**: Amazon S3 cloud storage

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=8000
BASE_URL=http://localhost:8000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/maitexa

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=90d

# File Upload Configuration
DEFAULT_STORAGE=local
LOCAL_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ENABLE_IMAGE_OPTIMIZATION=true
IMAGE_QUALITY=80
MAX_IMAGE_WIDTH=1920
MAX_IMAGE_HEIGHT=1080
GENERATE_THUMBNAILS=true
THUMBNAIL_WIDTH=300
THUMBNAIL_HEIGHT=300
PRESERVE_ORIGINAL=true
CLEANUP_TEMP_FILES=true
VIRUS_SCAN_ENABLED=false
DUPLICATE_CHECK_ENABLED=true

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=maitexa
CLOUDINARY_MAX_FILE_SIZE=10485760

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_S3_FOLDER=maitexa
AWS_S3_MAX_FILE_SIZE=10485760
```

### 3. Start the Server

```bash
npm start
```

## API Endpoints

### File Upload Endpoints

#### 1. Single File Upload
```http
POST /api/v1/upload/single
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- file: <file>
- storageType: local|cloudinary|s3 (optional)
- uploadType: general|profile|document (optional)
- optimizeImage: true|false (optional)
- generateThumbnail: true|false (optional)
```

#### 2. Multiple Files Upload
```http
POST /api/v1/upload/multiple
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- files: <files[]>
- storageType: local|cloudinary|s3 (optional)
- uploadType: general|profile|document (optional)
- optimizeImage: true|false (optional)
- generateThumbnail: true|false (optional)
```

#### 3. Named Files Upload
```http
POST /api/v1/upload/named
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- profile: <file> (max 1)
- resume: <file> (max 1)
- certificate: <files[]> (max 5)
- assignment: <files[]> (max 10)
- storageType: local|cloudinary|s3 (optional)
- optimizeImage: true|false (optional)
- generateThumbnail: true|false (optional)
```

#### 4. Student-Specific Upload
```http
POST /api/v1/upload/student
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- studentId: <string> (required)
- profile: <file> (optional)
- resume: <file> (optional)
- certificate: <files[]> (optional)
- storageType: local|cloudinary|s3 (optional)
- optimizeImage: true|false (optional)
- generateThumbnail: true|false (optional)
```

#### 5. Course Materials Upload
```http
POST /api/v1/upload/course
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- courseId: <string> (required)
- files: <files[]> (required)
- materialType: assignment|document|general (optional)
- storageType: local|cloudinary|s3 (optional)
- optimizeImage: true|false (optional)
- generateThumbnail: true|false (optional)
```

#### 6. Trainer Profile Upload
```http
POST /api/v1/upload/trainer
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- trainerId: <string> (required)
- file: <file> (required)
- storageType: local|cloudinary|s3 (optional)
- optimizeImage: true|false (optional)
- generateThumbnail: true|false (optional)
```

### File Management Endpoints

#### 1. Delete File
```http
DELETE /api/v1/upload/{fileId}
Authorization: Bearer <token>

Query Parameters:
- storageType: local|cloudinary|s3 (optional)
```

#### 2. Get File Information
```http
GET /api/v1/upload/{fileId}/info
Authorization: Bearer <token>

Query Parameters:
- storageType: local|cloudinary|s3 (optional)
```

#### 3. Generate Signed URL
```http
GET /api/v1/upload/{fileId}/signed-url
Authorization: Bearer <token>

Query Parameters:
- storageType: local|cloudinary|s3 (optional)
- expiresIn: <seconds> (optional, default: 3600)
```

#### 4. Check File Exists
```http
GET /api/v1/upload/{fileId}/exists
Authorization: Bearer <token>

Query Parameters:
- storageType: local|cloudinary|s3 (optional)
```

### Configuration Endpoints

#### 1. Get Upload Configuration
```http
GET /api/v1/upload/config
Authorization: Bearer <token>

Query Parameters:
- storageType: local|cloudinary|s3 (optional)
```

#### 2. Health Check
```http
GET /api/v1/upload/health
```

## Usage Examples

### Using cURL

#### Single File Upload
```bash
curl -X POST http://localhost:8000/api/v1/upload/single \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@/path/to/file.jpg" \
  -F "storageType=local" \
  -F "uploadType=profile"
```

#### Multiple Files Upload
```bash
curl -X POST http://localhost:8000/api/v1/upload/multiple \
  -H "Authorization: Bearer <your-token>" \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.pdf" \
  -F "storageType=cloudinary"
```

#### Named Files Upload
```bash
curl -X POST http://localhost:8000/api/v1/upload/named \
  -H "Authorization: Bearer <your-token>" \
  -F "profile=@/path/to/profile.jpg" \
  -F "resume=@/path/to/resume.pdf" \
  -F "certificate=@/path/to/cert1.pdf" \
  -F "certificate=@/path/to/cert2.pdf"
```

### Using JavaScript/Fetch

#### Single File Upload
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('storageType', 'local');
formData.append('uploadType', 'profile');

const response = await fetch('/api/v1/upload/single', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

#### Multiple Files Upload
```javascript
const formData = new FormData();
Array.from(fileInput.files).forEach(file => {
  formData.append('files', file);
});
formData.append('storageType', 'cloudinary');

const response = await fetch('/api/v1/upload/multiple', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

## Configuration

### File Upload Configuration

The file upload system is configured through the `config/fileUpload.js` file. Key configuration options include:

#### General Settings
- `defaultStorage`: Default storage provider (local, cloudinary, s3)
- `enableImageOptimization`: Enable/disable image optimization
- `imageQuality`: Image quality for optimization (1-100)
- `maxWidth/maxHeight`: Maximum image dimensions
- `generateThumbnails`: Enable/disable thumbnail generation
- `thumbnailSize`: Thumbnail dimensions

#### Storage-Specific Settings
- **Local Storage**: Upload path, max file size, allowed MIME types
- **Cloudinary**: Cloud name, API credentials, folder structure
- **AWS S3**: Access keys, bucket name, region, folder structure

#### Upload Types
- **Single**: One file per request
- **Multiple**: Multiple files per request (configurable limit)
- **Named**: Specific field names with individual limits

### File Validation

The system validates files based on:
- **File Size**: Configurable maximum size per storage provider
- **File Type**: Allowed MIME types per storage provider
- **Filename**: Length and character restrictions
- **File Content**: Basic content validation

## Storage Providers

### Local Storage
- **Pros**: Simple setup, no external dependencies
- **Cons**: Limited scalability, server storage usage
- **Best For**: Development, small-scale deployments

### Cloudinary
- **Pros**: Excellent image optimization, CDN, easy setup
- **Cons**: Limited to images and videos, pricing for high usage
- **Best For**: Image-heavy applications, content delivery

### AWS S3
- **Pros**: Highly scalable, cost-effective, supports all file types
- **Cons**: More complex setup, requires AWS account
- **Best For**: Production applications, large file storage

## Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control
- Endpoint-specific permissions

### File Security
- File type validation
- File size limits
- Filename sanitization
- Secure file storage

### Access Control
- Signed URLs for secure file access
- Configurable URL expiration
- Role-based file access

## Error Handling

The system provides comprehensive error handling:

### Common Error Types
- `400 Bad Request`: Invalid file, size, or type
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: File not found
- `500 Internal Server Error`: Server-side errors

### Error Response Format
```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

## Monitoring & Logging

### Logging
- File upload events
- Error logging
- Performance metrics
- Storage usage tracking

### Health Checks
- Storage provider connectivity
- Service availability
- Configuration validation

## Performance Optimization

### Image Optimization
- Automatic resizing
- Format conversion
- Quality optimization
- Thumbnail generation

### File Processing
- Asynchronous processing
- Memory-efficient handling
- Temporary file cleanup
- Batch processing

## Troubleshooting

### Common Issues

#### 1. File Upload Fails
- Check file size limits
- Verify file type is allowed
- Ensure proper authentication
- Check storage provider configuration

#### 2. Image Optimization Issues
- Verify Sharp installation
- Check image format support
- Review optimization settings

#### 3. Storage Provider Errors
- Validate credentials
- Check network connectivity
- Verify bucket/folder permissions

#### 4. Permission Errors
- Check JWT token validity
- Verify user role permissions
- Review endpoint authorization

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## Best Practices

### File Upload
1. Always validate files on both client and server
2. Use appropriate file size limits
3. Implement proper error handling
4. Clean up temporary files
5. Use secure file storage

### Security
1. Validate file types and content
2. Implement proper authentication
3. Use role-based access control
4. Sanitize filenames
5. Use signed URLs for sensitive files

### Performance
1. Optimize images before storage
2. Use appropriate storage providers
3. Implement caching strategies
4. Monitor storage usage
5. Clean up unused files

## Support

For issues and questions:
- Check the API documentation at `/api-docs`
- Review error logs
- Test with the health check endpoint
- Contact the development team

---

**Note**: This file upload system is designed to be modular and extensible. Additional storage providers and upload types can be easily added by implementing the appropriate interfaces. 