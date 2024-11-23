import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { StationData } from '../train-station-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
})
export class AutocompleteComponent implements OnInit {
  @Input() set suggestions(value: StationData[]) {
    this._suggestions = value.sort((a: StationData, b: StationData) => {
      const aName = (a.stationName || '').toLowerCase();
      const bName = (b.stationName || '').toLowerCase();
      return aName.localeCompare(bName);
    });
  }
  get suggestions() {
    return this._suggestions;
  }
  private _suggestions: StationData[];
  private destroyRef = inject(DestroyRef);

  searchInput: FormControl = new FormControl('');

  filteredSuggestions: StationData[] = [];
  typedText: string = '';
  remainingHint: string = '';
  selectedHistory: StationData[] = [];

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.filteredSuggestions = [];
    }
  }

  public ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(
        debounceTime(300),
        tap((val) => {
          if (!val) {
            this.remainingHint = '';
            this.typedText = '';
          }
        }),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => this.updateSuggestions(value));
  }

  public selectSuggestion(suggestion: StationData): void {
    this.searchInput.setValue(suggestion.stationName, { emitEvent: false });
    this.filteredSuggestions = [];
    this.typedText = suggestion.stationName;
    this.remainingHint = '';

    if (
      !this.selectedHistory.some(
        (historySuggestion) =>
          historySuggestion.stationName === suggestion.stationName
      )
    ) {
      this.selectedHistory.push(suggestion);
    }
  }

  public onFocus(): void {
    if (!this.searchInput.value) {
      this.filteredSuggestions = [...this.selectedHistory];
    }
    this.updateSuggestions(this.searchInput.value);
  }

  public onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab' && this.filteredSuggestions.length) {
      event.preventDefault();
      this.selectSuggestion(this.filteredSuggestions[0]);
    }
  }

  public updateSuggestions(input: string): void {
    this.typedText = input;
    if (!input) {
      this.remainingHint = '';
      this.filteredSuggestions = this.selectedHistory.length
        ? [...this.selectedHistory]
        : [];
      return;
    }

    this.filteredSuggestions = this.suggestions.filter((suggestion) =>
      suggestion.stationName.toLowerCase().startsWith(input.toLowerCase())
    );

    if (this.filteredSuggestions.length > 0) {
      const suggestion = this.filteredSuggestions[0];
      this.remainingHint = suggestion.stationName.substring(input.length);
    } else {
      this.remainingHint = '';
    }
  }
}
