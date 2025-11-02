import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../common/config/prismaClient';
import { serializeBigInt } from '../../common/utils/serializeBigInt';

export const getStocks = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const stocks = await prisma.stock.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    });

    const safeStocks = serializeBigInt(stocks);

    return res.status(httpStatus.OK).json({
      message: 'Get stock list successfully',
      data: safeStocks,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    } else {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }
};

export const getStock = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Invalid stock id',
      });
    }

    const stock = await prisma.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'Stock not found',
      });
    }

    const result = {
      ...stock,
      volume: stock.volume?.toString(),
      averageVolume: stock.averageVolume?.toString(),
    };

    return res.status(httpStatus.OK).json({ data: result });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    } else {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }
};
