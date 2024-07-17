import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  user_name: string;
  role: "admin" | "user";
  iat: number;
  exp: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};
