import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: string;
  user_name: string;
  role: "admin" | "user";
  iat: number;
  exp: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      id: decoded.id,
      user_name: decoded.user_name,
      role: decoded.role || "user",
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
