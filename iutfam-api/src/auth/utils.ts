function isEmailAllowed(email: string, allowed = process.env.ALLOWED_EMAIL_DOMAINS!.split(",")) {
  return allowed.some(suffix => email.endsWith(suffix));
}
export { isEmailAllowed };
