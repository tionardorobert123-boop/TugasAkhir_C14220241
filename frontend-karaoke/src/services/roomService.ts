import API from "./api";

export const getRooms = async () => {
  const res = await API.get("/rooms");
  return res.data;
};

export const openRoom = async (id: number) => {
  return API.post(`/rooms/${id}/open`);
};

export const closeRoom = async (id: number) => {
  return API.post(`/rooms/${id}/close`);
};