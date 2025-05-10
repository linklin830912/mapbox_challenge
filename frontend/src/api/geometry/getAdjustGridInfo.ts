import { API_GET_ADJUST_GRID_INFO } from "../../const/API_CONSTANT";
import { AdjustGridInfo, GridInfo } from "../../models/GridInfo";
import { convertMeterToLongLatitude } from "../../utils/geoJson/convertMeterToLongLatitude";
import { api } from "../api";

type GridInfoResponse = {
  gridinfo: GridInfo;
}
export async function getAdjustGridInfo(gridinfo: AdjustGridInfo, rotate: number, shiftX: number, shiftY: number,): Promise<GridInfo>{
    const { longtitude, latitude } = convertMeterToLongLatitude(gridinfo.gridX, gridinfo.gridY);
  const { longtitude: shiftLongtitude, latitude: shiftLatitude } = convertMeterToLongLatitude(shiftX, shiftY);
  const longlatGridinfo = {...gridinfo, gridX: latitude, gridY:longtitude} as GridInfo
    const response = await api.post<GridInfoResponse>(API_GET_ADJUST_GRID_INFO ,{ gridinfo: longlatGridinfo, rotate:rotate, shiftX:shiftLongtitude, shiftY:shiftLatitude });
    return response.data.gridinfo
}