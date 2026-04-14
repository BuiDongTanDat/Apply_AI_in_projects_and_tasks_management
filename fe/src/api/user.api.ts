import { ProfileFormValues } from "@/pages/profile/ProfilePage";
import axiosInstance, { Query } from "./axiosInstance";

const getProfile = async () => {
    const response = await axiosInstance.get("/user/profile");
    return response.data?.metadata;
}

const updateProfile = async (data: ProfileFormValues) => {
    const response = await axiosInstance.put("/user/profile", data);
    return response.data?.metadata;
};

const getAll = async (query: Query) => {
    const response = await axiosInstance.get("/user", { params: query });
    console.log("getAll users response:", response.data?.metadata);
    return response.data?.metadata;
}

export const userApi = {
    getProfile,
    updateProfile,
    getAll,
};