import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { FlightCardComponent } from '../flight-card/flight-card.component';
import { CityPipe } from '@flight-demo/shared/ui-common';
import { Flight, FlightService } from '@flight-demo/tickets/domain';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  imports: [CommonModule, FormsModule, CityPipe, FlightCardComponent],
})
export class FlightSearchComponent {
  from = signal('London');
  to = signal('New York');
  flights: Array<Flight> = [];
  selectedFlight: Flight | undefined;

  from$ = toObservable(this.from).pipe(
    debounceTime(3_000)
  );
  debouncedFrom = toSignal(this.from$, {
    initialValue: this.from()
  });
  flightRoute = computed(
    () => 'From ' + this.debouncedFrom() + ' to ' + this.to() + '.'
  );

  basket: Record<number, boolean> = {
    3: true,
    5: true,
  };

  private flightService = inject(FlightService);

  constructor() {
    effect(
      () => console.log(this.flightRoute())
    );
  }

  search(): void {
    if (!this.from() || !this.to()) {
      return;
    }

    // Reset properties
    this.selectedFlight = undefined;

    this.flightService.find(this.from(), this.to()).subscribe({
      next: (flights) => {
        this.flights = flights;
      },
      error: (errResp) => {
        console.error('Error loading flights', errResp);
      },
    });
  }

  select(f: Flight): void {
    this.selectedFlight = { ...f };
  }
}
