import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetBlogsQueryDto } from './dto/get-blogs-query.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

const BLOG_ID_NOT_FOUND_MESSAGE =
  "The blog post with this ID doesn't exist. Please check and re-enter.";
const COMMENT_ID_NOT_FOUND_MESSAGE =
  "The comment with this ID doesn't exist. Please check and re-enter.";
const WORDS_PER_MINUTE = 225;

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async createBlog(createBlogDto: CreateBlogDto) {
    const slug = this.createSlug(createBlogDto.title);

    try {
      const existingBlog = await this.prisma.blog.findFirst({
        where: {
          OR: [{ title: createBlogDto.title.trim() }, { slug }],
        },
      });

      if (existingBlog) {
        throw new BadRequestException(
          'This title is already used. Please try another title.',
        );
      }

      return await this.prisma.blog.create({
        data: {
          ...createBlogDto,
          readingTimeMinutes:
            createBlogDto.readingTimeMinutes ??
            this.estimateReadingTime(createBlogDto.content),
          likes: 0,
          commentCount: 0,
          slug,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async getAllBlogs(query: GetBlogsQueryDto) {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const sort = query.sort ?? 'newest';
      const skip = (page - 1) * limit;
      const where = this.buildBlogWhereInput(query);

      const [data, total] = await this.prisma.$transaction([
        this.prisma.blog.findMany({
          where,
          orderBy: {
            createdAt: sort === 'oldest' ? 'asc' : 'desc',
          },
          skip,
          take: limit,
        }),
        this.prisma.blog.count({ where }),
      ]);
      const blogsWithActualCommentCounts =
        await this.withActualCommentCounts(data);

      return {
        data: blogsWithActualCommentCounts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async getBlogStats() {
    try {
      const [totalPosts, draftPosts, publishedPosts] =
        await this.prisma.$transaction([
          this.prisma.blog.count(),
          this.prisma.blog.count({ where: { published: false } }),
          this.prisma.blog.count({ where: { published: true } }),
        ]);

      return {
        totalPosts,
        draftPosts,
        publishedPosts,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async getBlogById(id: string) {
    this.validateBlogIdForLookup(id);

    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      this.handleBlogIdNotFound();
    }

    return await this.withActualCommentCount(blog);
  }

  async updateBlog(id: string, updateBlogDto: UpdateBlogDto) {
    await this.getBlogById(id);

    const data: Prisma.BlogUpdateInput = {
      ...updateBlogDto,
      ...(updateBlogDto.title
        ? { slug: this.createSlug(updateBlogDto.title) }
        : {}),
      ...(updateBlogDto.content &&
      updateBlogDto.readingTimeMinutes === undefined
        ? {
            readingTimeMinutes: this.estimateReadingTime(updateBlogDto.content),
          }
        : {}),
    };

    try {
      return await this.prisma.blog.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async deleteBlog(id: string) {
    this.validateObjectId(id);
    await this.getBlogById(id);

    try {
      await this.prisma.blog.delete({
        where: { id },
      });

      return { message: 'Blog deleted successfully' };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async likeBlog(id: string) {
    const blog = await this.getBlogById(id);

    try {
      return await this.prisma.blog.update({
        where: { id },
        data: {
          likes: (blog.likes ?? 0) + 1,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async addComment(id: string, createCommentDto: CreateCommentDto) {
    await this.getBlogById(id);

    try {
      const [comment, updatedBlog] = await this.prisma.$transaction([
        this.prisma.comment.create({
          data: {
            text: createCommentDto.text.trim(),
            blogId: id,
          },
        }),
        this.prisma.blog.update({
          where: { id },
          data: {
            commentCount: {
              increment: 1,
            },
          },
        }),
      ]);

      return {
        comment,
        blog: await this.withActualCommentCount(updatedBlog),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async getCommentsByBlogId(id: string) {
    await this.getBlogById(id);

    try {
      return await this.prisma.comment.findMany({
        where: { blogId: id },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async deleteComment(id: string, commentId: string) {
    await this.getBlogById(id);
    this.validateObjectId(commentId);

    try {
      const existingComment = await this.prisma.comment.findFirst({
        where: {
          id: commentId,
          blogId: id,
        },
      });

      if (!existingComment) {
        this.handleCommentIdNotFound();
      }

      await this.prisma.comment.delete({
        where: { id: commentId },
      });

      const actualCommentCount = await this.prisma.comment.count({
        where: { blogId: id },
      });

      const blog = await this.prisma.blog.update({
        where: { id },
        data: {
          commentCount: actualCommentCount,
        },
      });

      return {
        message: 'Comment deleted successfully',
        blog: {
          ...blog,
          commentCount: actualCommentCount,
        },
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private validateObjectId(
    id: string,
    message = 'There was a problem with the information you provided. Please review your input and try again.',
  ) {
    if (!/^[a-f\d]{24}$/i.test(id)) {
      throw new BadRequestException(message);
    }
  }

  private validateBlogIdForLookup(id: string) {
    if (!/^[a-f\d]{24}$/i.test(id)) {
      this.handleBlogIdNotFound();
    }
  }

  private handleBlogIdNotFound(): never {
    throw new NotFoundException(BLOG_ID_NOT_FOUND_MESSAGE);
  }

  private handleCommentIdNotFound(): never {
    throw new NotFoundException(COMMENT_ID_NOT_FOUND_MESSAGE);
  }

  private createSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private estimateReadingTime(content: string) {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  }

  private async withActualCommentCounts<T extends { id: string }>(
    blogs: T[],
  ): Promise<Array<T & { commentCount: number }>> {
    return await Promise.all(
      blogs.map((blog) => this.withActualCommentCount(blog)),
    );
  }

  private async withActualCommentCount<T extends { id: string }>(
    blog: T,
  ): Promise<T & { commentCount: number }> {
    const commentCount = await this.prisma.comment.count({
      where: { blogId: blog.id },
    });

    return {
      ...blog,
      commentCount,
    };
  }

  private buildBlogWhereInput(query: GetBlogsQueryDto): Prisma.BlogWhereInput {
    const where: Prisma.BlogWhereInput = {};
    const search = query.search?.trim();

    if (typeof query.published === 'boolean') {
      where.published = query.published;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
          },
        },
        {
          author: {
            contains: search,
          },
        },
      ];
    }

    return where;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) {
      throw error;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      this.handleBlogIdNotFound();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(
        'This title is already used. Please try another title.',
      );
    }

    if (
      error instanceof Prisma.PrismaClientInitializationError ||
      this.isDatabaseUnavailableError(error)
    ) {
      throw new ServiceUnavailableException(
        'Database is unavailable. Check MongoDB Atlas network access and DNS.',
      );
    }

    throw new ServiceUnavailableException(
      'Unable to complete the database request right now. Please check your database connection and try again.',
    );
  }

  private isDatabaseUnavailableError(error: unknown): boolean {
    const prismaError = error as {
      code?: string;
      message?: string;
      meta?: {
        code?: string;
        message?: string;
      };
    };

    const rawMessage = [
      prismaError.code,
      prismaError.message,
      prismaError.meta?.code,
      prismaError.meta?.message,
    ]
      .filter((value): value is string => typeof value === 'string')
      .join(' ');

    return /server selection timeout|server selection timed out|no available servers|ReplicaSetNoPrimary|timed out|connection|dns|ENOTFOUND|ECONNREFUSED/i.test(
      rawMessage,
    );
  }
}
