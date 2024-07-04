import axiosInstance from "../http/axiosInstance";
import Cookies from "js-cookie";

interface LoginResponse {
  accessToken: string;
}
export const login = async (
  user_name: string,
  password: string
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(`user/login`, {
    user_name,
    password,
  });
  if (response.status === 200) {
    const { accessToken } = response.data;
    Cookies.set("access_token", accessToken, {
      expires: 7, // 7 days
      path: "/",
    });
    return response.data;
  }
  throw new Error("Invalid login Credentials");
};

export const logout = async () => {
  try {
    Cookies.remove("access_token");
    return true;
  } catch (error) {
    console.error("Error logging out", error);
    throw error;

  }
}