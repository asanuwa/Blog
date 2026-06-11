import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

/**
 * Swagger decorators for endpoints that accept a single file via multipart/form-data.
 *
 * Usage:
 *   @SwaggerFileUploadDecorator()
 *   upload(@UploadedFile() file: Express.Multer.File) {}
 */
export function SwaggerFileUploadDecorator(fieldName = 'file') {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
        required: [fieldName],
      },
    }),
  );
}
