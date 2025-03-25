// src/common/services/handlebars.service.ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import * as fs from "fs";
import * as handlebars from "handlebars";
import * as path from "path";

@Injectable()
export class HandlebarsService implements OnModuleInit {
  private readonly partialsDir = path.join(
    __dirname,
    "../../../../views/partials/"
  );

  onModuleInit() {
    this.registerPartials();
    this.registerHelpers();
  }

  private registerPartials() {
    const files = fs.readdirSync(this.partialsDir);
    files.forEach((file) => {
      if (file.endsWith(".hbs")) {
        const name = file.replace(".hbs", "");
        const partial = fs.readFileSync(
          path.join(this.partialsDir, file),
          "utf-8"
        );
        handlebars.registerPartial(name, partial);
      }
    });
  }

  private registerHelpers() {
    handlebars.registerHelper("eq", (a, b) => a == b);
  }

  public compile(templatePath: string, data: any): string {
    const templateSource = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateSource);
    return template(data);
  }
}
