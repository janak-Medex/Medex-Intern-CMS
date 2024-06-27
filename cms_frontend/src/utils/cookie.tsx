export function getCookie(name: string): string | undefined {
  const value = `;${document.cookie}`;

  const part = value.split(`;${name}=`);

  if (part.length === 2) {
    const cookieValue = part.pop()?.split(";").shift();
    return cookieValue;
  }

  return undefined;
}
