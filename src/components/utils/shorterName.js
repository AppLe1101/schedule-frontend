export function shorterName(fullName) {
  if (!fullName) return "";

  const parts = fullName.trim().split(" ");
  if (parts.length < 2) return fullName;

  const lastName = parts[0];
  const initials = parts.slice(1).map((n) => n.charAt(0).toUpperCase() + ".");

  return `${lastName} ${initials.join(" ")}`;
}
