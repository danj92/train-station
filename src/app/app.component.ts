import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutocompleteComponent } from './autocomplete';
import { TrainStationService } from './train-station-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StationData } from './train-station-model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AutocompleteComponent],
  providers: [TrainStationService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public stations: StationData[] = [];
  public errorMessage: string | null;
  private destroyRef = inject(DestroyRef);
  constructor(private trainStationService: TrainStationService) {}

  public ngOnInit(): void {
    this.trainStationService
      .fetchStations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stations) => {
          this.stations = stations;
          this.errorMessage = null;
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred.';
          console.error('Error:', error);
        },
      });
  }
}
