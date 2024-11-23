import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { StationData } from '../train-station-model';

@Injectable({
  providedIn: 'root',
})
export class TrainStationService {
  private readonly apiUrl = '/api/stations';

  constructor(private http: HttpClient) {}

  fetchStations(): Observable<StationData[]> {
    return this.http.get<StationData[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching stations:', error);
        return throwError(() => new Error('Failed to fetch stations.'));
      })
    );
  }
}
