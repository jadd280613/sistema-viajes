import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { appSettings } from '../Settings/app.settings';
import { Travel } from '../Models/Travel';
import { ResponseAPI } from '../Models/ResponseAPI';

@Injectable({
  providedIn: 'root',
})
export class TravelsService {
  private http = inject(HttpClient);
  private apiUrl: string = appSettings.apiUrl + 'travel';

  constructor() {}

  getTravelsList() {
    return this.http.get<Travel[]>(this.apiUrl);
  }
  getTravel(id: number) {
    return this.http.get<Travel>(`${this.apiUrl}/${id}`);
  }

  createTravel(values: Travel) {
    return this.http.post<ResponseAPI>(this.apiUrl, values);
  }

  updateTravel(values: Travel) {
    return this.http.put<ResponseAPI>(this.apiUrl, values);
  }

  deleteTravel(id: number) {
    return this.http.delete<ResponseAPI>(`${this.apiUrl}/${id}`);
  }
}
