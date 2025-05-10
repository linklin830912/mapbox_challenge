import { API_GET_ANALYSIS_GRID_INFO } from "../../const/API_CONSTANT";
import { GridInfo } from "../../models/GridInfo";
import { Polygon } from "../../models/Polygon";
import { convertMeterToLongLatitude } from "../../utils/geoJson/convertMeterToLongLatitude";
import { api } from "../api";

type GridInfoResponse = {
  gridinfo: GridInfo;
}
export async function getAnalysisGridInfo(
  polygon: Polygon, gridX: number, gridY: number, rotate: number, shiftX: number, shiftY: number,): Promise<GridInfo>{
  //convert meters to long, lat
  const { longtitude:gridLong, latitude:gridLat } = convertMeterToLongLatitude(gridX, gridY);
  const { longtitude: shiftLongtitude, latitude: shiftLatitude } = convertMeterToLongLatitude(shiftX, shiftY);
  const response = await api.post<GridInfoResponse>(API_GET_ANALYSIS_GRID_INFO, { polygon: polygon, gridX: gridLat, gridY: gridLong, rotate: rotate, shiftX: shiftLatitude, shiftY: shiftLongtitude });

  return response.data.gridinfo
}