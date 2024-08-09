import Cookies from "js-cookie";
import axiosInstance from "../http/axiosInstance";

interface LoginResponse {
  accessToken: string;
  user: {
    _id: string;
    user_name: string;
    role: string;
    is_active: boolean;
  };
}

interface User {
  _id: string;
  user_name: string;
  role: string;
  is_active: boolean;
}

export const login = async (
  user_name: string,
  password: string
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>("/user/login", {
    user_name,
    password,
  });
  if (response.status === 200) {

    const { accessToken } = response.data;
    console.log("Setting access token:", accessToken);
    Cookies.set("access_token", accessToken, {
      expires: 1, // 1 day
      path: "/",
    });
    console.log("Access token after set:", Cookies.get("access_token"));
    window.dispatchEvent(new Event('auth-change'));
    return response.data;
  }
  throw new Error("Invalid login Credentials");
};

export const logout = async (): Promise<void> => {
  console.log("Logout function called");
  try {
    await axiosInstance.post("/user/logout", null, {
      headers: {
        'Authorization': `Bearer ${Cookies.get('access_token')}`
      }
    });
    console.log("Removing access token");
    Cookies.remove("access_token");
    console.log("Access token after removal:", Cookies.get("access_token"));
    window.dispatchEvent(new Event('auth-change'));
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

export const isAuthenticated = (): boolean => {
  const token = Cookies.get('access_token');
  console.log("Checking authentication, token:", token);
  return !!token;
};



export const createUser = async (userData: { user_name: string; password: string; is_active: boolean }): Promise<User> => {
  const response = await axiosInstance.post('/user/register', userData, {
    headers: {
      'Authorization': `Bearer ${Cookies.get('access_token')}`
    }
  });
  return response.data.user;
};
export const getAllUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get('/user/users', {
    headers: {
      'Authorization': `Bearer ${Cookies.get('access_token')}`
    }
  });
  return response.data.users;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response = await axiosInstance.put(`/user/users/${userId}`, userData, {
    headers: {
      'Authorization': `Bearer ${Cookies.get('access_token')}`
    }
  });
  return response.data.user;
};

export const updateOwnPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await axiosInstance.put('/user/change-password', { currentPassword, newPassword }, {
    headers: {
      'Authorization': `Bearer ${Cookies.get('access_token')}`
    }
  });
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/user/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${Cookies.get('access_token')}`
    }
  });
};