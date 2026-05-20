import axios from "axios";

axios.defaults.withCredentials = true;

const axiosClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export default axiosClient;
