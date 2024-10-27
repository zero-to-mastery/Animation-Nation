const formatProjectName = (projectName) => {
  return projectName
    // Handle camel case: adds space before uppercase letters following lowercase letters
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Replace hyphens and underscores with spaces
    .replace(/[-_]/g, ' ')
    .trim();
};

module.exports = { formatProjectName };
