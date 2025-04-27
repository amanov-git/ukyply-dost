import toast from "react-hot-toast";

const handleAxiosError = (error) => {
  if (
    error.response.status === 404 ||
    error.response.status === 401 ||
    error.response.status === 400 ||
    error.response.status === 500 ||
    error.response.status === 409
  ) {
    toast.error(error.response?.data?.msg);
    console.error('Error posting data: ', error)
  }
};

export default handleAxiosError;