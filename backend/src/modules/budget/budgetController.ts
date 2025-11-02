import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import prisma from '../../common/config/prismaClient';
import * as budgetModels from './budgetModels';

export const createBudget = async (req: Request, res: Response) => {};
