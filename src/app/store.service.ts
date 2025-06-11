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
  deleteDoc,
  onSnapshot,
} from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import type {
  getUserStoreData,
  ServiceStoreData,
  ServiceData,
  StoreCompleteData,
  getServiceData,
  StoreInfo,
} from './types/store';
import type { UserData, UserInfoData } from './types/user';
import { cita } from './types/date';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  constructor(private firestore: Firestore) {}

  /**
   * 🏪 SOLO DATOS DE LA TIENDA - Para store.page.ts
   * Función simple que solo trae información básica de la tienda
   */
  getStoreData(userUID: string): Observable<getUserStoreData> {
    console.log('🏪 Buscando datos de tienda para:', userUID);

    const q = query(
      collection(this.firestore, 'stores'),
      where('userUID', '==', userUID),
      limit(1)
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const storeData: getUserStoreData = querySnapshot.empty
          ? {
              userUID,
              documentId: '',
              storeInfo: { bussinessName: '', direction: '', categories: [] },
            }
          : {
              userUID,
              documentId: querySnapshot.docs[0].id,
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
  getServicesByStoreId(storeId: string): Observable<getServiceData[]> {
    const q = query(
      collection(this.firestore, 'service'),
      where('storeId', '==', storeId)
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const services = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            documentId: doc.id,
            storeId: data['storeId'],
            serviceData: data['serviceData'],
          } as getServiceData;
        });
        console.log('✅ Servicios encontrados:', services.length);
        return services;
      })
    );
  }

  /**
   * 📋 Busca servicios segun su id
   */
  getServiceById(serviceId: string): Observable<getServiceData> {
    const docRef = doc(this.firestore, 'service', serviceId);
    return from(getDoc(docRef)).pipe(
      map((serviceDoc) => ({
        documentId: serviceId,
        storeId: serviceDoc.exists() ? serviceDoc.data()?.['storeId'] : '',
        serviceData: serviceDoc.exists()
          ? serviceDoc.data()?.['serviceData']
          : [],
      }))
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

  getAllStores(): Observable<getUserStoreData[]> {
    return new Observable((observer) => {
      const unsubscribe = onSnapshot(
        collection(this.firestore, 'stores'),
        (snapshot) => {
          const stores = snapshot.docs.map(
            (doc) =>
              ({
                documentId: doc.id,
                userUID: doc.data()['userUID'],
                storeInfo: doc.data()['storeInfo'],
              } as getUserStoreData)
          );
          observer.next(stores);
        },
        (error) => observer.error(error)
      );

      return () => unsubscribe();
    });
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
  getStoreByUID(uid: string): Observable<getUserStoreData> {
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

  async createCita(citaData: cita) {
    try {
      if (!citaData) {
        throw new Error('Los datos son requeridos.');
      }
      const id = `${citaData.idUsuario}-${Date.now()}`;
      await setDoc(doc(this.firestore, 'cita', id), {
        cita: citaData,
      });
      console.log('cita creada');
    } catch (error) {
      console.error('Error al crear la cita: ', error);
      throw error;
    }
  }

  async updateUserType(uid: string, type: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', uid);
    await updateDoc(userDocRef, { 'userInfo.tipe': type });
  }

  async updateUser(uid: string, userInfo: UserInfoData) {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      await updateDoc(userDocRef, { userInfo });
      console.log('✅ Usuario actualizado:', uid);
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      throw error;
    }
  }

  async updateService(
    documentId: string,
    serviceData: ServiceStoreData
  ): Promise<void> {
    try {
      const serviceDocRef = doc(this.firestore, 'service', documentId);
      await updateDoc(serviceDocRef, {
        serviceData: serviceData,
      });
      console.log('✅ Servicio actualizado:', documentId);
    } catch (error) {
      console.error('❌ Error actualizando servicio:', error);
      throw error;
    }
  }

  async updateStore(storeId: string, storeData: StoreInfo) {
    try {
      const storeDocRef = doc(this.firestore, 'stores', storeId);
      await updateDoc(storeDocRef, {
        storeInfo: storeData,
      });
      console.log('✅ Tienda actualizada:', storeId);
    } catch (error) {
      console.error('❌ Error actualizando tienda:', error);
      throw error;
    }
  }

  async deleteService(documentId: string) {
    try {
      await deleteDoc(doc(this.firestore, 'service', documentId));
      console.log('✅ Servicio eliminado:', documentId);
    } catch (error) {
      console.error('❌ Error eliminar servicio:', error);
      throw error;
    }
  }

  async deleteStore(documentId: string) {
    try {
      const servicesQuery = query(
        collection(this.firestore, 'service'),
        where('storeId', '==', documentId)
      );
      const servicesSnapshot = await getDocs(servicesQuery);
      const deleteServicePromises = servicesSnapshot.docs.map((serviceDoc) =>
        deleteDoc(doc(this.firestore, 'service', serviceDoc.id))
      );
      await Promise.all(deleteServicePromises);
      console.log(
        `✅ ${servicesSnapshot.docs.length} servicios eliminados para la tienda: ${documentId}`
      );
      await deleteDoc(doc(this.firestore, 'stores', documentId));
      console.log('✅ Tienda eliminado:', documentId);
    } catch (error) {
      console.error('❌ Error eliminar tienda:', error);
      throw error;
    }
  }
}
