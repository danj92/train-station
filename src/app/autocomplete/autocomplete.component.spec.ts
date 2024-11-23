// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { AutocompleteComponent } from './autocomplete.component';

// describe('AutocompleteComponent', () => {
//   let component: AutocompleteComponent;
//   let fixture: ComponentFixture<AutocompleteComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [AutocompleteComponent]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(AutocompleteComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AutocompleteComponent } from './autocomplete.component';
import { StationData } from '../train-station-model';
import { CommonModule } from '@angular/common';

describe('AutocompleteComponent', () => {
  let component: AutocompleteComponent;
  let fixture: ComponentFixture<AutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, AutocompleteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('suggestions', () => {
    it('should sort suggestions alphabetically', () => {
      const suggestions: StationData[] = [
        { stationName: 'Dartford', stationCode: 'DFD' },
        { stationName: 'Darton', stationCode: 'DRT' },
      ];

      component.suggestions = suggestions;

      expect(component.suggestions).toEqual([
        { stationName: 'Dartford', stationCode: 'DFD' },
        { stationName: 'Darton', stationCode: 'DRT' },
      ]);
    });
  });

  describe('updateSuggestions', () => {
    beforeEach(() => {
      component.suggestions = [
        { stationName: 'Dartford', stationCode: 'DFD' },
        { stationName: 'Darton', stationCode: 'DRT' },
      ];
    });

    it('should filter suggestions based on input', () => {
      component.updateSuggestions('Dartf');
      expect(component.filteredSuggestions).toEqual([
        { stationName: 'Dartford', stationCode: 'DFD' },
      ]);
    });

    it('should set remainingHint to the unmatched portion of the first match', () => {
      component.updateSuggestions('Dartf');
      expect(component.remainingHint).toBe('ord');
    });

    it('should clear filteredSuggestions and remainingHint if input is empty', () => {
      component.updateSuggestions('');
      expect(component.filteredSuggestions).toEqual([]);
      expect(component.remainingHint).toBe('');
    });
  });

  describe('selectSuggestion', () => {
    it('should set the selected suggestion as the input value', () => {
      const suggestion: StationData = {
        stationName: 'Dartford',
        stationCode: 'DFD',
      };
      component.selectSuggestion(suggestion);

      expect(component.searchInput.value).toBe('Dartford');
      expect(component.filteredSuggestions).toEqual([]);
      expect(component.remainingHint).toBe('');
    });

    it('should add the selected suggestion to history if not already present', () => {
      const suggestion: StationData = {
        stationName: 'Dartford',
        stationCode: 'DFD',
      };
      component.selectSuggestion(suggestion);

      expect(component.selectedHistory).toContain(suggestion);
    });

    it('should not add duplicate suggestions to history', () => {
      const suggestion: StationData = {
        stationName: 'Dartford',
        stationCode: 'DFD',
      };
      component.selectedHistory = [suggestion];
      component.selectSuggestion(suggestion);

      expect(component.selectedHistory.length).toBe(1);
    });
  });

  describe('handleClickOutside', () => {
    it('should clear filteredSuggestions when clicked outside the component', () => {
      const mockEvent = {
        target: document.createElement('div'),
      } as unknown as Event;
      spyOn(component['elementRef'].nativeElement, 'contains').and.returnValue(
        false
      );

      component.handleClickOutside(mockEvent);
      expect(component.filteredSuggestions).toEqual([]);
    });

    it('should not clear filteredSuggestions when clicked inside the component', () => {
      const mockEvent = {
        target: document.createElement('div'),
      } as unknown as Event;
      spyOn(component['elementRef'].nativeElement, 'contains').and.returnValue(
        true
      );

      component.handleClickOutside(mockEvent);
      expect(component.filteredSuggestions).toEqual([]);
    });
  });

  describe('onFocus', () => {
    it('should show history when input is empty', () => {
      component.selectedHistory = [
        { stationName: 'Dartford', stationCode: 'DFD' },
      ];
      component.searchInput.setValue('');
      component.onFocus();

      expect(component.filteredSuggestions).toEqual([
        { stationName: 'Dartford', stationCode: 'DFD' },
      ]);
    });

    it('should update suggestions when input is not empty', () => {
      component.suggestions = [
        { stationName: 'Dartford', stationCode: 'DFD' },
        { stationName: 'Darton', stationCode: 'DRT' },
      ];
      component.searchInput.setValue('Dartf');
      component.onFocus();

      expect(component.filteredSuggestions).toEqual([
        { stationName: 'Dartford', stationCode: 'DFD' },
      ]);
    });
  });

  describe('onKeydown', () => {
    it('should select the first suggestion on Tab key press', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      spyOn(event, 'preventDefault');

      component.filteredSuggestions = [
        { stationName: 'Dartford', stationCode: 'DFD' },
      ];

      component.onKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.searchInput.value).toBe('Dartford');
    });
  });
});
