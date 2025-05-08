import { TOKEN_NAME } from "@modules/auth";
import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { Multer } from "multer";
import { MinioService } from "../minio.service";

@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "upload",
  version: "1",
})
export class FileController {
  constructor(private minioService: MinioService) {}

  @Get("/:path")
  async viewFile(@Param("path") path: string) {
    console.log(path);
    return await this.minioService.getPreviewUrl(path);
  }

  @Post("image")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "image file",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file: Multer.File) {
    return await this.minioService.uploadImage(
      new Date().getTime() + "-" + file.originalname,
      file.buffer
    );
  }

  @Post("document")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "document file",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadDocument(@UploadedFile() file: Multer.File) {
    return await this.minioService.uploadFile(
      "documents",
      new Date().getTime() + "-" + file.originalname,
      file.buffer
    );
  }
}
