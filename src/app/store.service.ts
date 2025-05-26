import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  updateDoc,
} from '@angular/fire/firestore';
import { from, type Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import type {
  UserStoreData,
  ServiceStoreData,
  ServiceData,
  StoreCompleteData,
} from './types/store';
import type { UserData } from './types/user';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  constructor(private firestore: Firestore) {}

  /**
   * 🏪 SOLO DATOS DE LA TIENDA - Para store.page.ts
   * Función simple que solo trae información básica de la tienda
   */
  getStoreData(userUID: string): Observable<UserStoreData> {
    console.log('🏪 Buscando datos de tienda para:', userUID);

    const q = query(
      collection(this.firestore, 'stores'),
      where('userUID', '==', userUID),
      limit(1)
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const storeData: UserStoreData = querySnapshot.empty
          ? {
              userUID,
              storeInfo: { bussinessName: '', direction: '', categories: [] },
            }
          : {
              userUID,
              storeInfo: querySnapshot.docs[0].data()?.['storeInfo'] || {
                bussinessName: '',
                direction: '',
                categories: [],
              },
            };

        console.log('✅ Datos de tienda cargados:', storeData);
        return storeData;
      }),
      catchError((error) => {
        console.error('❌ Error cargando tienda:', error);
        throw error;
      })
    );
  }

  /**
   * 🛠️ SOLO SERVICIOS - Para store-service.page.ts
   * Busca el ID de la tienda y luego trae solo los servicios
   */
  getStoreServices(userUID: string): Observable<ServiceData[]> {
    console.log('🛠️ Buscando servicios para usuario:', userUID);

    // Paso 1: Obtener ID de la tienda
    return this.getStoreIds(userUID).pipe(
      switchMap((storeIds) => {
        if (storeIds.length === 0) {
          console.log('⚠️ No hay tiendas, devolviendo servicios vacíos');
          return of([]);
        }

        // Paso 2: Buscar servicios de la primera tienda
        return this.getServicesByStoreId(storeIds[0]);
      }),
      catchError((error) => {
        console.error('❌ Error cargando servicios:', error);
        return of([]); // Devolver array vacío en caso de error
      })
    );
  }

  /**
   * 🆔 Obtener IDs de tiendas (función auxiliar)
   */
  private getStoreIds(userUID: string): Observable<string[]> {
    const q = query(
      collection(this.firestore, 'stores'),
      where('userUID', '==', userUID)
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const storeIds = querySnapshot.docs.map((doc) => doc.id);
        console.log('🆔 IDs de tienda encontrados:', storeIds);
        return storeIds;
      })
    );
  }

  /**
   * 📋 Busca servicios de una tienda específica
   */
  private getServicesByStoreId(storeId: string): Observable<ServiceData[]> {
    const q = query(
      collection(this.firestore, 'service'),
      where('storeId', '==', storeId)
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const services = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            storeId: data['storeId'],
            serviceData: data['serviceData'],
          } as ServiceData;
        });
        console.log('✅ Servicios encontrados:', services.length);
        return services;
      })
    );
  }

  /**
   * ➕ Crear servicio - Versión simplificada
   */
  async createServiceForUser(
    userUID: string,
    serviceData: ServiceStoreData
  ): Promise<void> {
    console.log('➕ Creando servicio para usuario:', userUID);

    // Paso 1: Obtener ID de la tienda
    const storeIds = await this.getStoreIdsAsync(userUID);
    if (storeIds.length === 0) {
      throw new Error('No tienes tiendas creadas');
    }

    // Paso 2: Crear el servicio
    await this.createService(storeIds[0], serviceData);
    console.log('✅ Servicio creado exitosamente');
  }

  /**
   * 🆔 Versión async para obtener IDs (para crear servicios)
   */
  private async getStoreIdsAsync(userUID: string): Promise<string[]> {
    const q = query(
      collection(this.firestore, 'stores'),
      where('userUID', '==', userUID)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.id);
  }

  /**
   * 💾 Crear servicio en Firebase
   */
  private async createService(
    storeId: string,
    serviceData: ServiceStoreData
  ): Promise<void> {
    const serviceId = `${Date.now()}_${storeId}`;
    const serviceDocument: ServiceData = {
      storeId,
      serviceData,
    };

    await setDoc(doc(this.firestore, 'service', serviceId), serviceDocument);
  }

  // 📝 Funciones originales mantenidas para compatibilidad
  getCompleteStoreData(userUID: string): Observable<StoreCompleteData> {
    return this.getStoreData(userUID).pipe(
      switchMap((storeInfo) => {
        return this.getStoreServices(userUID).pipe(
          map((services) => ({
            storeInfo,
            storeIds: [], // Se puede llenar si es necesario
            services,
          }))
        );
      })
    );
  }

  async createUserInfo(UID: string, userInfo: any): Promise<void> {
    await setDoc(doc(this.firestore, 'users', UID), { userInfo });
  }

  async createUserStore(userUID: string, storeInfo: any): Promise<void> {
    const storeId = `${Date.now()}_${userUID}`;
    await setDoc(doc(this.firestore, 'stores', storeId), {
      userUID,
      storeInfo,
    });
  }

  getUserData(uid: string): Observable<UserData> {
    const userDocRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userDocRef)).pipe(
      map((userDoc) => ({
        UID: uid,
        userInfoData: userDoc.exists()
          ? userDoc.data()?.['userInfo']
          : { name: '', lastName: '', rut: '', tipe: '' },
      }))
    );
  }

  // Mantener para compatibilidad
  getStoreByUID(uid: string): Observable<UserStoreData> {
    return this.getStoreData(uid);
  }

  async getStoreIdsByUserUID(userUID: string): Promise<string[]> {
    return this.getStoreIdsAsync(userUID);
  }

  async createServiceStore(storeID: string, serviceData: ServiceStoreData) {
    try {
      if (!storeID || !serviceData) {
        throw new Error('UID and userInfo are required');
      }

      const serviceId = `${Date.now()}_${storeID}`;

      await setDoc(doc(this.firestore, 'service', serviceId), {
        storeId: storeID,

        serviceData: serviceData,
      });

      console.log('Servico creado.');
    } catch (error) {
      console.error('Error al crear el servicio: ', error);
      throw error;
    }
  }

  async updateUserType(uid: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', uid);
    await updateDoc(userDocRef, { 'userInfo.tipe': 'administrador' });
  }
}
