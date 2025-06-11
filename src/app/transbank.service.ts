import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { LoadingController, ToastController } from '@ionic/angular';
import {
  CreateTransactionResponse,
  ConfirmTransactionRequest,
  ConfirmTransactionResponse,
  TransactionRequest,
} from './types/transbank';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Injectable({
  providedIn: 'root',
})
export class TransbankService {
  private baseUrl = 'https://v0-docut-api-di.vercel.app/api/transbank';
  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private toastControlle: ToastController,
    private iab: InAppBrowser
  ) {}

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  createTransaction(
    transactionData: TransactionRequest
  ): Observable<CreateTransactionResponse> {
    return this.http.post<CreateTransactionResponse>(
      `${this.baseUrl}/create`,
      transactionData,
      {
        headers: this.getHeaders(),
      }
    );
  }

  confirmTransaction(token: string): Observable<ConfirmTransactionResponse> {
    const confirmData: ConfirmTransactionRequest = { token };
    return this.http.post<ConfirmTransactionResponse>(
      `${this.baseUrl}/confirm`,
      confirmData,
      {
        headers: this.getHeaders(),
      }
    );
  }

  redirectToPayment(url: string) {
    this.iab.create(url, '_system');
  }

  async showLoading(message = 'Procesando. . .') {
    const loading = await this.loadingController.create({
      message: message,
      spinner: 'crescent',
    });
    await loading.present();
    return loading;
  }

  async showToast(message: string, color = 'success') {
    const toast = await this.toastControlle.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    await toast.present();
  }
}
