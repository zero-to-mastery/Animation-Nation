const formatProjectName = (projectName) => {
  // Handles camel case project name
  if (/[a-z][A-Z]/.test(projectName)) {
    projectName = projectName.replaceAll(/([A-Z])/g, ' $1');
  }

  // Handles hyphens in project name
  if (projectName.includes('-')) {
    projectName = projectName.replaceAll('-', ' ');
  }

  // Handles underscores in project name
  if (projectName.includes('_')) {
    projectName = projectName.replace('_', ' ');
  }

  return projectName.trim();
};

module.exports = { formatProjectName };
