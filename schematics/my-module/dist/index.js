"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myModuleGenerator = myModuleGenerator;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
function myModuleGenerator(options) {
    return (tree, _context) => {
        const rawName = options.name;
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
            resourceName = segments.pop(); // e.g. "warehouse2"
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
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)("./files"), [
            (0, schematics_1.template)({
                ...options,
                ...core_1.strings,
                name: resourceName,
                fields: fieldsArray,
                timestamp,
            }),
            (0, schematics_1.forEach)((fileEntry) => {
                if (fileEntry.path.endsWith(".template")) {
                    const newPath = fileEntry.path.replace(".template", "");
                    return {
                        path: newPath,
                        content: fileEntry.content,
                    };
                }
                return fileEntry;
            }),
            (0, schematics_1.move)(`./src/${core_1.strings.dasherize(path)}/${core_1.strings.dasherize(resourceName)}`),
        ]);
        return (0, schematics_1.mergeWith)(templateSource)(tree, _context);
    };
}
