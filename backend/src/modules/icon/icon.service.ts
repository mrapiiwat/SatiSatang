import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { BUCKET_NAME, s3Client } from "@/common/config/s3";
import { NotFoundError } from "@/common/errors";
import { db } from "@/db";
import { icon } from "@/db/schema";
import type * as iconSchema from "./icon.schema";

export class IconService {
  async createIcon(userId: number, data: iconSchema.createIcon) {
    const file = data.url;

    const ext = file.name.split(".").pop();
    const filename = `${uuidv4()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const [newIcon] = await db
      .insert(icon)
      .values({
        url: filename,
        description: data.description || null,
        userId: userId,
      })
      .returning();

    return newIcon;
  }

  async getIcons(userId: number, search?: string) {
    const isAccessible = or(isNull(icon.userId), eq(icon.userId, userId));

    let whereCondition = isAccessible;

    if (search) {
      const searchTerms = search.split(" ").filter(Boolean);

      if (searchTerms.length > 0) {
        const searchFilters = searchTerms.map((term) =>
          ilike(icon.description, `%${term}%`)
        );
        whereCondition = and(isAccessible, or(...searchFilters));
      }
    }

    const icons = await db.query.icon.findMany({
      where: whereCondition,
      orderBy: [desc(icon.createdAt)],
    });

    if (icons.length === 0) throw new NotFoundError("No icons found");

    const iconsWithUrl = await Promise.all(
      icons.map(async (i) => {
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: i.url,
        });

        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return {
          id: i.id,
          url: signedUrl,
          description: i.description,
        };
      })
    );

    return iconsWithUrl;
  }

  async getIconUrl(iconId: number) {
    const iconRecord = await db.query.icon.findFirst({
      where: eq(icon.id, iconId),
    });

    if (!iconRecord) {
      throw new NotFoundError("Icon not found");
    }

    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: iconRecord.url,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });

      return {
        url: signedUrl,
        filename: iconRecord.url,
      };
    } catch (error) {
      console.error("S3 Signing Error:", error);
      throw new Error("Cannot generate image URL");
    }
  }

  async updateIcon(iconId: number, data: iconSchema.updateIcon) {
    const existingIcon = await db.query.icon.findFirst({
      where: eq(icon.id, iconId),
    });

    if (!existingIcon) {
      throw new NotFoundError("Icon not found");
    }

    let newStoragePath = existingIcon.url;

    if (data.url) {
      const file = data.url;
      const ext = file.name.split(".").pop();
      const filename = `${uuidv4()}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: filename,
          Body: buffer,
          ContentType: file.type,
        })
      );

      if (existingIcon.url) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: existingIcon.url,
            })
          );
        } catch (err) {
          console.warn(`Failed to remove old file (${existingIcon.url}):`, err);
        }
      }

      newStoragePath = filename;
    }

    const [updatedIcon] = await db
      .update(icon)
      .set({
        url: newStoragePath,
        description: data.description ?? existingIcon.description,
        updatedAt: new Date(),
      })
      .where(eq(icon.id, iconId))
      .returning();

    return updatedIcon;
  }
}
