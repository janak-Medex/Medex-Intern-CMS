export function getCookie(name: string): string | undefined {
  const value = `;${document.cookie}`;
  const part = value.split(`;${name}=`);
  if (part.length === 2) {
    return part.pop()?.split(";").shift();
  }
  return undefined;
}
