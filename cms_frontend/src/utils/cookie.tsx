export function getCookie(name: string): string | undefined {
  const value = `;${document.cookie}`;

  console.log("document.cookie:", document.cookie);

  const part = value.split(`;${name}=`);
  console.log("part:", part);

  if (part.length === 2) {
    const cookieValue = part.pop()?.split(";").shift();
    console.log(`Cookie value for ${name}: ${cookieValue}`);
    return cookieValue;
  }

  console.log(`No cookie found for ${name}`);
  return undefined;
}
