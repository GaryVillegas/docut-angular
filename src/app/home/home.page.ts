import { Component, OnInit } from '@angular/core';
import { getUserStoreData } from '../types/store';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  stores: getUserStoreData[] = [];
  constructor(private storeServ: StoreService) {}

  ngOnInit() {
    this.storeServ.getAllStores().subscribe((stores) => {
      this.stores = stores;
      console.log('Todas las Tiendas', stores);
    });
  }
}
