import axiosInstance from "./axiosInstance";


export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await axiosInstance.post("/upload/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
    return response.data?.metadata;
}