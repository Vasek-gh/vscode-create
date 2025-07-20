module.exports = async ({
  componentName,
  componentName_toPascalCase,
  _toCamelCase,
  Case
}) => `export interface ${componentName_toPascalCase} {
}
`;
