export interface Travel {
  travelId?: number;
  origin: string;
  destination: string;
  startDate: string;
  startTime: Date | string;
  endDate: string;
  endTime: Date | string;
  operatorTravel: string;
}
