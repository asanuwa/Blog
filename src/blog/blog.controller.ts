import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerFileUploadDecorator } from '../common/decorators/swagger-file-upload.decorator';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { Request } from 'express';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetBlogsQueryDto } from './dto/get-blogs-query.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogEntity } from './entities/blog.entity';
import { CommentEntity } from './entities/comment.entity';

const blogExample = {
  id: '665f1f77bcf86cd799439011',
  title: 'Building a REST API with NestJS',
  content:
    'This post explains how to structure a scalable REST API with NestJS, Prisma, and MongoDB.',
  author: 'Ben',
  coverImageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
  readingTimeMinutes: 4,
  likes: 12,
  commentCount: 3,
  slug: 'building-a-rest-api-with-nestjs',
  published: true,
  createdAt: '2026-06-03T12:00:00.000Z',
  updatedAt: '2026-06-03T12:00:00.000Z',
};

const validationErrorExample = {
  success: false,
  statusCode: 400,
  message:
    'There was a problem with the information you provided. Please review your input and try again.',
  timestamp: '2026-06-03T12:00:00.000Z',
};

const duplicateTitleErrorExample = {
  success: false,
  statusCode: 400,
  message: 'This title is already used. Please try another title.',
  timestamp: '2026-06-03T12:00:00.000Z',
};

const notFoundErrorExample = {
  success: false,
  statusCode: 404,
  message:
    "The blog post with this ID doesn't exist. Please check and re-enter.",
  timestamp: '2026-06-03T12:00:00.000Z',
};

const databaseUnavailableErrorExample = {
  success: false,
  statusCode: 503,
  message:
    'Database is unavailable. Check MongoDB Atlas network access and DNS.',
  timestamp: '2026-06-03T12:00:00.000Z',
};

const coverUploadsDir = join(process.cwd(), 'uploads', 'blog-covers');

type UploadedCoverFile = Express.Multer.File;

function createCoverFilename(
  _request: Request,
  file: UploadedCoverFile,
  callback: (error: Error | null, filename: string) => void,
) {
  const extension = extname(file.originalname).toLowerCase();
  const uniqueName = `cover-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

  callback(null, uniqueName);
}

function validateCoverUpload(
  _request: Request,
  file: UploadedCoverFile,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.mimetype)) {
    callback(
      new BadRequestException(
        'Please upload a valid image file: JPG, PNG, WEBP, or GIF.',
      ),
      false,
    );
    return;
  }

  callback(null, true);
}

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a blog post',
    description:
      'Creates a new blog post, validates the request body, and automatically generates a slug from the title.',
  })
  @ApiBody({
    type: CreateBlogDto,
    examples: {
      publishedPost: {
        summary: 'Create a published blog post',
        value: {
          title: 'Building a REST API with NestJS',
          content:
            'This post explains how to structure a scalable REST API with NestJS, Prisma, and MongoDB.',
          author: 'Ben',
          published: true,
        },
      },
      draftPost: {
        summary: 'Create a draft blog post',
        value: {
          title: 'Prisma MongoDB Guide',
          content:
            'This draft explains how Prisma models map cleanly to MongoDB documents in a NestJS application.',
          author: 'Ben',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Blog post created successfully.',
    type: BlogEntity,
    schema: {
      example: blogExample,
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or the generated slug already exists.',
    schema: {
      example: duplicateTitleErrorExample,
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'MongoDB is unavailable.',
    schema: {
      example: databaseUnavailableErrorExample,
    },
  })
  async create(@Body() createBlogDto: CreateBlogDto) {
    return await this.blogService.createBlog(createBlogDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all blog posts',
    description:
      'Returns paginated blog posts with optional search, publication filtering, and newest/oldest sorting.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of blogs per page.',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by blog title or author.',
    example: 'nestjs',
  })
  @ApiQuery({
    name: 'published',
    required: false,
    description: 'Filter by publication status.',
    example: true,
    type: Boolean,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort by creation date.',
    enum: ['newest', 'oldest'],
    example: 'newest',
  })
  @ApiOkResponse({
    description: 'Paginated blog posts returned successfully.',
    schema: {
      example: {
        data: [blogExample],
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'MongoDB is unavailable.',
    schema: {
      example: databaseUnavailableErrorExample,
    },
  })
  async findAll(@Query() query: GetBlogsQueryDto) {
    return await this.blogService.getAllBlogs(query);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get blog dashboard statistics',
    description:
      'Returns total, draft, and published post counts for dashboard cards.',
  })
  @ApiOkResponse({
    description: 'Blog dashboard statistics returned successfully.',
    schema: {
      example: {
        totalPosts: 24,
        draftPosts: 5,
        publishedPosts: 19,
      },
    },
  })
  async stats() {
    return await this.blogService.getBlogStats();
  }

  @Post('cover-upload')
  @HttpCode(HttpStatus.CREATED)
  @SwaggerFileUploadDecorator('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          mkdirSync(coverUploadsDir, { recursive: true });
          callback(null, coverUploadsDir);
        },
        filename: createCoverFilename,
      }),
      fileFilter: validateCoverUpload,
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload a blog cover image',
    description:
      'Uploads a local image selected from the file manager and returns a public URL.',
  })
  @ApiOkResponse({
    description: 'Cover image uploaded successfully.',
    schema: {
      example: {
        coverImageUrl: 'http://localhost:3000/uploads/blog-covers/cover.png',
      },
    },
  })
  uploadCover(
    @UploadedFile() file: UploadedCoverFile | undefined,
    @Req() request: Request,
  ) {
    if (!file) {
      throw new BadRequestException('Please choose a cover image to upload.');
    }

    const origin = `${request.protocol}://${request.get('host')}`;

    return {
      coverImageUrl: `${origin}/uploads/blog-covers/${file.filename}`,
    };
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get comments for a blog post',
    description:
      'Returns all saved comments for the selected blog post, ordered from newest to oldest.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the blog post.',
    example: '665f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Blog comments returned successfully.',
    type: CommentEntity,
    isArray: true,
    schema: {
      example: [
        {
          id: '665f1f77bcf86cd799439012',
          text: 'This was a helpful read. Thanks for sharing it.',
          blogId: '665f1f77bcf86cd799439011',
          createdAt: '2026-06-03T12:20:00.000Z',
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Blog post was not found.',
    schema: {
      example: notFoundErrorExample,
    },
  })
  async getComments(@Param('id') id: string) {
    return await this.blogService.getCommentsByBlogId(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a blog post by ID',
    description:
      'Validates the MongoDB ObjectId and returns the matching blog post.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the blog post.',
    example: '665f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Blog post returned successfully.',
    type: BlogEntity,
    schema: {
      example: blogExample,
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid MongoDB ObjectId.',
    schema: {
      example: notFoundErrorExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'Blog post was not found.',
    schema: {
      example: notFoundErrorExample,
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'MongoDB is unavailable.',
    schema: {
      example: databaseUnavailableErrorExample,
    },
  })
  async findOne(@Param('id') id: string) {
    return await this.blogService.getBlogById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a blog post',
    description:
      'Updates one or more blog post fields. If title changes, the slug is regenerated automatically.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the blog post.',
    example: '665f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateBlogDto,
    examples: {
      publishPost: {
        summary: 'Publish a blog post',
        value: {
          published: true,
        },
      },
      updateTitle: {
        summary: 'Update title and regenerate slug',
        value: {
          title: 'Scaling a NestJS Blog API',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Blog post updated successfully.',
    type: BlogEntity,
    schema: {
      example: {
        ...blogExample,
        title: 'Scaling a NestJS Blog API',
        slug: 'scaling-a-nestjs-blog-api',
        updatedAt: '2026-06-03T12:15:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed, ObjectId is invalid, or slug exists.',
    schema: {
      example: duplicateTitleErrorExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'Blog post was not found.',
    schema: {
      example: notFoundErrorExample,
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'MongoDB is unavailable.',
    schema: {
      example: databaseUnavailableErrorExample,
    },
  })
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return await this.blogService.updateBlog(id, updateBlogDto);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Like a blog post',
    description:
      'Validates the MongoDB ObjectId and increments the like count for the blog post.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the blog post.',
    example: '665f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Blog post liked successfully.',
    type: BlogEntity,
    schema: {
      example: {
        ...blogExample,
        likes: 13,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Blog post was not found.',
    schema: {
      example: notFoundErrorExample,
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'MongoDB is unavailable.',
    schema: {
      example: databaseUnavailableErrorExample,
    },
  })
  async like(@Param('id') id: string) {
    return await this.blogService.likeBlog(id);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a comment for a blog post',
    description:
      'Validates the MongoDB ObjectId, creates a new comment with the submitted text, associates it with the blog post, and updates the blog comment count.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the blog post.',
    example: '665f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: CreateCommentDto,
    examples: {
      comment: {
        summary: 'Create a blog comment',
        value: {
          text: 'This was a helpful read. Thanks for sharing it.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Comment created and blog comment count updated successfully.',
    schema: {
      example: {
        comment: {
          id: '665f1f77bcf86cd799439012',
          text: 'This was a helpful read. Thanks for sharing it.',
          blogId: '665f1f77bcf86cd799439011',
          createdAt: '2026-06-03T12:20:00.000Z',
        },
        blog: {
          ...blogExample,
          commentCount: 4,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Comment text is missing or invalid.',
    schema: {
      example: validationErrorExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'Blog post was not found.',
    schema: {
      example: notFoundErrorExample,
    },
  })
  async addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.blogService.addComment(id, createCommentDto);
  }

  @Delete(':id/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a comment from a blog post',
    description:
      'Deletes a saved comment for the selected blog post and recalculates the blog comment count.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the blog post.',
    example: '665f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'commentId',
    description: 'MongoDB ObjectId of the comment.',
    example: '665f1f77bcf86cd799439012',
  })
  @ApiOkResponse({
    description: 'Comment deleted and blog comment count updated successfully.',
    schema: {
      example: {
        message: 'Comment deleted successfully',
        blog: {
          ...blogExample,
          commentCount: 2,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Blog post or comment was not found.',
    schema: {
      example: notFoundErrorExample,
    },
  })
  async deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    return await this.blogService.deleteComment(id, commentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a blog post',
    description:
      'Validates the MongoDB ObjectId, deletes the blog post, and returns a success message.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the blog post.',
    example: '665f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Blog post deleted successfully.',
    schema: {
      example: {
        message: 'Blog deleted successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid MongoDB ObjectId.',
    schema: {
      example: validationErrorExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'Blog post was not found.',
    schema: {
      example: notFoundErrorExample,
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'MongoDB is unavailable.',
    schema: {
      example: databaseUnavailableErrorExample,
    },
  })
  async remove(@Param('id') id: string) {
    return await this.blogService.deleteBlog(id);
  }
}
