import { strings } from "@angular-devkit/core";
import {
  apply,
  forEach,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from "@angular-devkit/schematics";

export function myModuleGenerator(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const rawName = options.name as string;

    // 1) Possibly split path from the rest
    //    e.g. "admin/warehouse2:fields=branch,name" →
    //         path+resource="admin/warehouse2" and fieldsPart="fields=branch,name"

    let pathAndResource = rawName;
    let fieldsPart = "";

    // Example delimiter: ":fields="
    const delimiterIndex = rawName.indexOf(":fields=");
    if (delimiterIndex > -1) {
      pathAndResource = rawName.substring(0, delimiterIndex); // e.g. "admin/warehouse2"
      fieldsPart = rawName.substring(delimiterIndex + 8); // e.g. "branch,name"
    }

    // 2) Now parse path vs. resource name if "admin/warehouse2"
    let path = "";
    let resourceName = pathAndResource;
    if (pathAndResource.includes("/")) {
      const segments = pathAndResource.split("/");
      resourceName = segments.pop() as string; // e.g. "warehouse2"
      path = segments.join("/"); // e.g. "admin"
    }

    // 3) Convert fieldsPart into an array
    //    e.g. "branch,name" → ["branch","name"]
    const fieldsArray = fieldsPart ? fieldsPart.split(",") : [];
    console.log("DEBUG -> raw=", options.name);
    console.log("DEBUG -> resourceName=", resourceName);
    console.log("DEBUG -> path=", path);
    console.log("DEBUG -> fields=", fieldsArray);
    const timestamp = new Date().getTime();

    const templateSource = apply(url("./files"), [
      template({
        ...options,
        ...strings,
        name: resourceName,
        fields: fieldsArray,
        timestamp,
      }),
      forEach((fileEntry: any) => {
        if (fileEntry.path.endsWith(".template")) {
          const newPath = fileEntry.path.replace(".template", "");
          return {
            path: newPath,
            content: fileEntry.content,
          };
        }
        return fileEntry;
      }),
      move(
        `./src/${strings.dasherize(path)}/${strings.dasherize(resourceName)}`
      ),
    ]);

    return mergeWith(templateSource)(tree, _context);
  };
}
