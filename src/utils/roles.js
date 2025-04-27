const roles = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  TRANSLATOR: 'translator',
  ACCOUNTANT: 'accountant'
};

export const canRenderComponent = (user, requiredRoles) => {
  if (!user || !user.role_name) return false; // Ensure user and role_name exist
  return requiredRoles.some(role => user.role_name.includes(role));
};


export default roles;