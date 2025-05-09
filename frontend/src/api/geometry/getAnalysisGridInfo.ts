import { API_GET_ANALYSIS_GRID_INFO } from "../../const/API_CONSTANT";
import { GridInfo } from "../../models/GridInfo";
import { Polygon } from "../../models/Polygon";
import { api } from "../api";

type GridInfoResponse = {
  gridinfo: GridInfo;
}
export async function getAnalysisGridInfo(
    polygon: Polygon, gridX: number, gridY: number, rotate: number, shiftX: number, shiftY: number,): Promise<GridInfo>{ 
      
    const response = await api.post<GridInfoResponse>(API_GET_ANALYSIS_GRID_INFO, { polygon, gridX, gridY, rotate, shiftX, shiftY });
    return response.data.gridinfo
}