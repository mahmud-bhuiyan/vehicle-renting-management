import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { RentBookingView } from '../../core/models/rent-booking.model';
import { BookingService } from '../../core/services/booking.service';
import { CarService } from '../../core/services/car.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { BackgroundRefreshComponent } from '../../shared/components/background-refresh/background-refresh';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    BackgroundRefreshComponent,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  protected readonly dashboardService = inject(DashboardService);
  protected readonly bookingService = inject(BookingService);
  protected readonly carService = inject(CarService);

  protected readonly recentBookings = computed(() => {
    return [...this.bookingService.bookings()]
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
      .slice(0, 5);
  });

  protected readonly stats = computed(() => {
    const data = this.dashboardService.data();

    return [
      {
        label: 'Total Vehicles',
        value: data ? String(data.totalCars) : '—',
        trend: data ? `${data.totalCars} in fleet` : 'Loading...',
        trendColor: 'text-indigo-600 dark:text-indigo-400',
        icon: 'heroTruck',
        iconBg: 'from-indigo-500 to-violet-500',
        accent: 'from-indigo-500 to-violet-500',
      },
      {
        label: 'Active Customers',
        value: data ? String(data.totalCustomers) : '—',
        trend: data ? `${data.totalCustomers} registered` : 'Loading...',
        trendColor: 'text-violet-600 dark:text-violet-400',
        icon: 'heroUsers',
        iconBg: 'from-violet-500 to-fuchsia-500',
        accent: 'from-violet-500 to-fuchsia-500',
      },
      {
        label: 'Bookings',
        value: data ? String(data.totalBookings) : '—',
        trend: data ? `${data.todaysBooking} today` : 'Loading...',
        trendColor: 'text-cyan-600 dark:text-cyan-400',
        icon: 'heroCalendarDays',
        iconBg: 'from-cyan-500 to-blue-500',
        accent: 'from-cyan-500 to-blue-500',
      },
      {
        label: 'Revenue',
        value: data ? data.totalAmount : null,
        trend: data ? `${data.todayTotalAmount} today` : 'Loading...',
        trendColor: 'text-emerald-600 dark:text-emerald-400',
        icon: 'heroBanknotes',
        iconBg: 'from-emerald-500 to-teal-500',
        accent: 'from-emerald-500 to-teal-500',
        isCurrency: true,
      },
    ];
  });

  protected readonly quickActions = [
    {
      label: 'Add vehicle',
      hint: 'Register a new rental car',
      icon: 'heroPlus',
      iconBg: 'from-indigo-500 to-violet-500',
      route: '/vehicles/create',
    },
    {
      label: 'New booking',
      hint: 'Book a vehicle for a customer',
      icon: 'heroClipboardDocumentList',
      iconBg: 'from-cyan-500 to-blue-500',
      route: '/book-vehicle',
    },
    {
      label: 'View ledger',
      hint: 'Customer spend and history',
      icon: 'heroChartBar',
      iconBg: 'from-emerald-500 to-teal-500',
      route: '/customer-ledger',
    },
  ];

  ngOnInit(): void {
    this.dashboardService.loadDashboardData();
    this.bookingService.loadBookings();
    this.carService.loadCars();
  }

  protected reloadDashboard(): void {
    this.dashboardService.loadDashboardData();
  }

  protected carLabel(carId: number): string {
    const car = this.carService.getCarFromCache(carId);
    return car ? `${car.brand} ${car.model}` : `Car #${carId}`;
  }

  protected trackBooking(booking: RentBookingView): string | number {
    return booking.bookingId ?? booking.bookingDate;
  }
}
