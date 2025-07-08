import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
  standalone: false,
})
export class StockPage implements OnInit {
  storeId: string | null = null;
  isLoading = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private storeServ: StoreService
  ) {}

  ngOnInit() {
    this.storeId = this.activatedRoute.snapshot.queryParamMap.get('id');
  }
}
