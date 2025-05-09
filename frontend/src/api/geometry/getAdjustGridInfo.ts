import { API_GET_ADJUST_GRID_INFO } from "../../const/API_CONSTANT";
import { AdjustGridInfo, GridInfo } from "../../models/GridInfo";
import { api } from "../api";

type GridInfoResponse = {
  gridinfo: GridInfo;
}
export async function getAdjustGridInfo(
    gridinfo:AdjustGridInfo, rotate: number, shiftX: number, shiftY: number,): Promise<GridInfo>{ 
    const response = await api.post<GridInfoResponse>(API_GET_ADJUST_GRID_INFO ,{ gridinfo, rotate, shiftX, shiftY });
    return response.data.gridinfo
}