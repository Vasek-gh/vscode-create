module.exports = async ({
  componentName,
  componentName_toPascalCase,
  _toCamelCase,
  Case
}) => `export class ${componentName_toPascalCase} {
    constructor(
    ) {
    }
};
`;
