import axios from "axios";

export const loginApi = async (email, sifre) => {
    const response = await axios.post("/api/auth/login", {
        email,
        sifre,
    });

    return response.data;
};

export const getMeApi = async () => {
    const response = await axios.get("/api/auth/me");
    return response.data;
};

export const changePasswordApi = async (mevcutSifre, yeniSifre) => {
    const response = await axios.put("/api/auth/change-password", {
        mevcutSifre,
        yeniSifre,
    });
    return response.data;
};