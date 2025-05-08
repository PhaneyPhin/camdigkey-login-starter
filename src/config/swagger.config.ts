import { AUTH_OPTIONS, TOKEN_NAME } from "@auth";
import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as fs from "fs";
import * as path from "path";

const title = "Nestjs Framework";
const description =
  "This is a basic Nest boilerplate project built on the more powerful Node.js framework. " +
  "The main purpose of this project is to dynamically handle roles and permissions assigned to the user.";

/**
 * Setup Swagger in the application and save the JSON output
 * @param app {INestApplication}
 * @param apiVersion {string}
 */
export const SwaggerConfig = (app: INestApplication, apiVersion: string) => {
  const options = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(apiVersion)
    .addBearerAuth(AUTH_OPTIONS, TOKEN_NAME)
    .build();

  const document = SwaggerModule.createDocument(app, options);

  // Setup Swagger UI at /api/v1/swagger
  SwaggerModule.setup(`api/v${apiVersion}/swagger`, app, document);

  // Define Swagger JSON file path
  const swaggerJsonPath = path.join(__dirname, `swagger-${apiVersion}.json`);

  // Write Swagger JSON to a file
  fs.writeFileSync(swaggerJsonPath, JSON.stringify(document, null, 2));

  console.log(`Swagger JSON file saved at: ${swaggerJsonPath}`);
};
