import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import * as iconModels from './iconModels';
import minioClient from '../../common/config/minioClient';
import crypto from 'crypto';
import prisma from '../../common/config/prismaClient';

const BUCKET = process.env.MINIO_BUCKET!;

export const createIcon = async (req: Request, res: Response) => {
  try {
    const validatedData = iconModels.createIconSchema.parse(req.body);

    const file = req.file;
    if (!file) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'File is required',
      });
    }

    const ext = file.originalname.split('.').pop();
    const filename = `${crypto.randomUUID()}.${ext}`;

    await minioClient.putObject(BUCKET, filename, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const icon = await prisma.icon.create({
      data: {
        url: filename,
        description: validatedData.description || null,
        userId: Number(validatedData.userId) || null,
      },
    });

    return res.status(httpStatus.CREATED).json({
      message: 'Icon uploaded successfully',
      data: icon,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Validation error',
        errors: error,
      });
    }

    if (error instanceof Error) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    }

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
    });
  }
};

export const getIcons = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;

    const where = search
      ? {
          OR: search.split(' ').map((word) => ({
            description: {
              contains: word,
              mode: 'insensitive' as const,
            },
            OR: [{ userId: null }, { userId: req.user }],
          })),
        }
      : {
          OR: [{ userId: null }, { userId: req.user }],
        };

    const data = await prisma.icon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (!data || data.length === 0) {
      return res.status(httpStatus.OK).json({
        message: 'No icons found',
        data: [],
      });
    }

    const iconsWithUrl = data.map((icon) => ({
      id: icon.id,
      url: `${process.env.APP_BASE_URL}/api/icon/${icon.id}`,
      description: icon.description,
    }));

    return res.status(httpStatus.OK).json({
      message: 'Icons fetched successfully',
      data: iconsWithUrl,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(httpStatus.BAD_REQUEST).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }
};

export const getIcon = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const icon = await prisma.icon.findUnique({ where: { id } });
    if (!icon) return res.status(httpStatus.NOT_FOUND).json({ message: 'Icon not found' });

    const stream = await minioClient.getObject(BUCKET, icon.url);

    res.setHeader('Content-Disposition', `inline; filename="${icon.url}"`);

    stream.pipe(res);
  } catch (error) {
    if (error instanceof Error) {
      res.status(httpStatus.BAD_REQUEST).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }
};

export const updateIcon = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Invalid icon id',
      });
    }

    const icon = await prisma.icon.findUnique({ where: { id } });
    if (!icon) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'Icon not found',
      });
    }

    let newStoragePath = icon.url;
    let description = req.body.description || icon.description;

    const file = req.file;
    if (file) {
      const ext = file.originalname.split('.').pop() || '';
      const filename = `${crypto.randomUUID()}${ext ? '.' + ext : ''}`;

      await minioClient.putObject(BUCKET, filename, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });

      try {
        await minioClient.removeObject(BUCKET, icon.url);
      } catch (err) {
        console.warn('⚠️ Failed to remove old file:', err);
      }

      newStoragePath = filename;
    }

    const updatedIcon = await prisma.icon.update({
      where: { id },
      data: {
        url: newStoragePath,
        description,
      },
    });

    return res.status(httpStatus.OK).json({
      message: 'Icon updated successfully',
      data: updatedIcon,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to update icon',
        errors: error.message,
      });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Unknown error occurred while updating icon',
    });
  }
};
