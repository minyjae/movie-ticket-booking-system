import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WalletService, LedgerEntry, WalletHistory } from '../../services/wallet.service';

@Component({
  selector: 'app-transaction-history',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './transaction-history.html',
})
export class TransactionHistory implements OnInit {
  private walletService = inject(WalletService);

  history = signal<WalletHistory | null>(null);
  entries = signal<LedgerEntry[]>([]);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  error = signal('');

  currentPage = signal(1);
  readonly pageSize = 20;

  hasMore = computed(() => {
    const h = this.history();
    if (!h) return false;
    return this.entries().length < h.total;
  });

  ngOnInit() {
    this.loadPage(1);
  }

  private loadPage(page: number) {
    if (page === 1) {
      this.isLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }

    this.walletService.getHistory(page, this.pageSize).subscribe({
      next: (data) => {
        this.history.set(data);
        if (page === 1) {
          this.entries.set(data.entries);
        } else {
          this.entries.update((prev) => [...prev, ...data.entries]);
        }
        this.currentPage.set(page);
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.error.set('ไม่สามารถโหลดประวัติการทำรายการได้');
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
    });
  }

  loadMore() {
    this.loadPage(this.currentPage() + 1);
  }

  isCredit(entry: LedgerEntry): boolean {
    return entry.amount > 0;
  }

  entryLabel(entry: LedgerEntry): string {
    switch (entry.type) {
      case 'Deposit':        return 'เติมเงิน';
      case 'TicketPurchase': return 'ซื้อตั๋ว';
      case 'Refund':         return 'คืนเงิน (ยกเลิกตั๋ว)';
      default:               return entry.type;
    }
  }
}
