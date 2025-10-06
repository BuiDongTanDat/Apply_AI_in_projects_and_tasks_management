/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "./axiosInstance";


const login = async (data: any) => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
};

const register = async (data: any) => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
};


export const authApi = {
    login,
    register,
};
