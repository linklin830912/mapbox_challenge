import { API_GET_HELLO_FROM_SERVER_ROUTE } from "../../const/API_CONSTANT";
import { api } from "../api";

type MessageResponse = {
  message: string;
}

export async function getHelloFromServer() : Promise<MessageResponse>{ 
    const response = await api.get(API_GET_HELLO_FROM_SERVER_ROUTE, { });
    return response.data
}