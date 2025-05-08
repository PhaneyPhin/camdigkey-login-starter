import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";
import { MinioProvider } from "./minio.provider";

@Injectable()
export class MinioService {
  private readonly client: Minio.Client;

  constructor(
    private readonly minioProvider: MinioProvider,
    private readonly configService: ConfigService
  ) {
    this.client = this.minioProvider.createClient();
  }

  public async uploadFile(bucketName: string, filePath: string, file: Buffer) {
    try {
      await this.client.putObject(bucketName, filePath, file);

      return filePath;
    } catch (error) {
      console.error("uploadFile", error);
      throw error;
    }
  }

  async generateTemLink(
    bucketName: string,
    objectName: string,
    expiry = 3600
  ): Promise<string> {
    try {
      return await this.client.presignedUrl(
        "GET",
        bucketName,
        objectName,
        expiry
      );
    } catch (error) {
      console.error("Error generating temporary link:", error);
      return null;
    }
  }

  private getMimeType(filePath: string): string {
    const extension = filePath.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      default:
        return "application/octet-stream";
    }
  }

  async getPreviewUrl(filePath: string): Promise<string> {
    try {
      const bucketName = "images"; // Replace with your bucket name
      const expiry = 60 * 60; // 1 hour (in seconds)

      // Add custom headers for preview
      const headers = {
        "response-content-type": this.getMimeType(filePath),
        "response-content-disposition": "inline",
      };

      // Generate the presigned URL with custom headers
      const url = await this.client.presignedGetObject(
        bucketName,
        filePath,
        expiry,
        headers
      );

      if (this.configService.get("MINIO_DNS")) {
        return url.replace(
          "http://" +
            this.configService.get("MINIO_ENDPOINT") +
            ":" +
            this.configService.get("MINIO_PORT"),
          this.configService.get("MINIO_DNS")
        );
      }
      return url;
    } catch (error) {
      throw new Error(`Failed to generate preview URL: ${error.message}`);
    }
  }

  async getImageLink(filePath: string) {
    return this.generateTemLink("images", filePath);
  }

  async uploadImage(filePath: string, file: Buffer) {
    console.log("uploadImage", filePath);
    return this.uploadFile("images", filePath, file);
  }

  async uploadDocument(filePath: string, file: Buffer) {
    return this.uploadFile("documents", filePath, file);
  }
}
