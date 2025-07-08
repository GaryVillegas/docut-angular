import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../store.service';
import { stockData, stockInfo } from '../types/stock.type';
import { IonPopover, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
  standalone: false,
})
export class StockPage implements OnInit {
  storeId: string | null = null;
  stockData: stockData | null = null;
  isLoading = true;
  stockInfo: stockInfo = {
    nombre: '',
    descripcion: '',
    cantidad: 0,
    storeId: '',
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private storeServ: StoreService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.storeId = this.activatedRoute.snapshot.queryParamMap.get('id');
    this.isLoading = false;
  }

  //create modal
  isCreateModalOpen = false;

  setOpenModal(isOpen: boolean) {
    this.isCreateModalOpen = isOpen;
    if (!isOpen) this.resetForm();
  }

  cancel() {
    this.isCreateModalOpen = false;
  }

  //from options
  private resetForm() {
    this.storeId = null;
  }

  //popover
  @ViewChild('popover') popover!: IonPopover;
  isOpenPopOver = false;
  currentPopoverContent = '';
  popoverContents: { [key: string]: string } = {
    btn1: 'Aqui especificas el nombre del producto.',
    btn2: 'Aqui especificas que es el producto',
    btn3: 'Aqui se coloca la cantidad de productos',
  };

  presentPopover(event: Event, buttonId: string) {
    this.currentPopoverContent = this.popoverContents[buttonId];
    this.popover.event = event;
    this.isOpenPopOver = true;
  }

  //create product
  async createProduct() {
    this.isLoading = true;
    try {
      if (!this.storeId) return;
      this.stockInfo.storeId = this.storeId;
      await this.storeServ.createProduct(this.storeId, this.stockInfo);
      this.setOpenModal(false);
    } catch (error) {
      console.error('Error al crear el producto: ', error);
      this.presentToast('Error', 'Error al crear el producto', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  //notification
  async presentToast(header: string, message: string, color: string) {
    const toast = await this.toastController.create({
      header: header,
      message: message,
      duration: 2000,
      position: 'top',
      color: color,
    });
    toast.present();
  }
}
