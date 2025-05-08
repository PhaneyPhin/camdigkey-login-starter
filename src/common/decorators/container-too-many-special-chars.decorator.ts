import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ async: false })
class ContainsTooManySpecialCharsConstraint
  implements ValidatorConstraintInterface
{
  validate(text: string, args: ValidationArguments) {
    // Get the max value from the constraints, defaulting to 1 if undefined
    const max = args.constraints[0] || 1;

    // Regular expression to match special characters
    const specialCharRegex = /[<>():;/="'`&%{}]/g;

    // Match all special characters in the text
    if (text && typeof text.match === "function") {
      const matches = text?.match(specialCharRegex);
      return !matches || matches.length <= max;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    // Display a message that includes the max number of allowed special characters
    const max = args.constraints[0] || 1;
    return `Text contains too many special characters. Maximum allowed is ${max}.`;
  }
}

export function ContainsTooManySpecialChars(
  max = 1,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [max], // Pass max as a constraint
      validator: ContainsTooManySpecialCharsConstraint,
    });
  };
}
