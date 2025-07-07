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
} from '@angular/fire/firestore';
import { userInfo, userData } from './types/user.type';
import { storeData, storeInfo, storeStatus } from './types/store.type';
import { service, serviceData } from './types/service.type';
import { date, dateData } from './types/date.type';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  constructor(private FIREBASE_DB: Firestore) {}
  public shouldReloadStores = false;
  public shouldReloadDate = false;

  //all create Functions

  /**
   * @param uid
   * @param userInfo
   * Para crear un usuario con su informacion
   */
  async createUser(uid: string, userInfo: userInfo): Promise<void> {
    try {
      if (!uid || !userInfo) {
        throw new Error('Toda la información en requerida.');
      }
      await setDoc(doc(this.FIREBASE_DB, 'users', uid), { userInfo });
      console.log('User Info created successfully');
    } catch (error) {
      console.error('Erroo creating user info: ', error);
      throw error;
    }
  }

  /**
   * @param userUID
   * @param storeInfo
   * Para crear una tienda con su informacion
   */
  async createStore(
    userUID: string,
    storeInfo: storeInfo,
    storeStatus: storeStatus
  ): Promise<void> {
    try {
      if (!userUID || !storeInfo) {
        throw new Error('Toda la información es requerida.');
      }
      const storeId = `${Date.now().toLocaleString()}_${userUID}`;
      await setDoc(doc(this.FIREBASE_DB, 'stores', storeId), {
        userUID,
        storeInfo,
        storeStatus,
      });
      console.log('Store created successfully!');
    } catch (error) {
      console.log('Error creating store: ', error);
      throw error;
    }
  }

  /**
   * @param storeId
   * @param serviceData
   * Para crear un servicio con su informacion
   */
  async createService(storeId: string, serviceData: service): Promise<void> {
    try {
      if (!serviceData || !storeId)
        throw new Error('Service data are requiered.');
      const serviceId = `${Date.now().toLocaleString()}_${storeId}`;

      await setDoc(doc(this.FIREBASE_DB, 'service', serviceId), {
        serviceData,
      });
      console.log('service created successfully!');
    } catch (error) {
      console.error('Error creating service: ', error);
      throw error;
    }
  }

  /**
   * @param cita
   */
  async createDate(cita: date): Promise<void> {
    try {
      if (!cita) {
        throw new Error('Los datos son requeridos.');
      }

      const citaExistente = await this.getUserDate(cita.idUsuario);
      if (citaExistente) {
        throw new Error('Ya tienes una cita activa por hoy.');
      }

      const id = `${cita.idUsuario}-${Date.now()}`;
      await setDoc(doc(this.FIREBASE_DB, 'cita', id), {
        cita: cita,
      });
      console.log('cita creada.');
    } catch (error) {
      console.error('Error al crear la cita: ', error);
      throw error;
    }
  }

  //all gets
  /**
   * @param uid
   * @returns
   * retorna los datos del usuario.
   */
  async getUserData(uid: string): Promise<userData | undefined> {
    try {
      const userRef = doc(this.FIREBASE_DB, 'users', uid);
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) {
        console.warn("🚫 service doesn't exit.");
        return undefined;
      }
      const data = userSnapshot.data();
      return {
        UID: uid,
        userInfo: data['userInfo'],
      } as userData;
    } catch (error) {
      console.log('❌ error catching service: ', error);
      throw error;
    }
  }

  /**
   * @param userUID
   * @returns storeID
   * Función que devuelve storeId.
   */
  async getStoreID(userUID: string): Promise<string | undefined> {
    try {
      if (!userUID) {
        throw new Error('userUID required.');
      }
      const storeQuery = query(
        collection(this.FIREBASE_DB, 'stores'),
        where('userUID', '==', userUID),
        limit(1)
      );
      const storeSnapshot = await getDocs(storeQuery);
      const store = storeSnapshot.docs.map((doc) => {
        const storeData = doc.data();
        return {
          storeId: doc.id,
          storeInfo: storeData['storeInfo'],
          storeStatus: storeData['storeStatus'],
        } as storeData;
      });
      console.log('Store catch: ', store);
      return store[0].storeId;
    } catch (error) {
      console.log('Error catching Store: ', error);
      throw error;
    }
  }

  //Funciones para obtener los datos
  /**
   * @param storeId
   * @returns
   * funcion para traer los servicios de la tienda.
   */
  async getStoreServices(storeId: string): Promise<serviceData[] | undefined> {
    try {
      const serviceQuery = query(
        collection(this.FIREBASE_DB, 'service'),
        where('serviceData.storeId', '==', storeId)
      );
      const serviceSnapshot = await getDocs(serviceQuery);
      const services = serviceSnapshot.docs.map((service) => {
        const serviceData = service.data();
        return {
          serviceId: service.id,
          serviceData: serviceData['serviceData'],
        } as serviceData;
      });
      console.log('✅ Services catchs: ', services);
      return services;
    } catch (error) {
      console.log('❌ error catching services: ', error);
      throw error;
    }
  }

  /**
   * @param userUID
   * @returns los datos de la tienda creada por el usuario.
   */
  async getUserStore(userUID: string): Promise<storeData | undefined> {
    try {
      if (!userUID) throw new Error('userUID required.');
      const storeQuery = query(
        collection(this.FIREBASE_DB, 'stores'),
        where('userUID', '==', userUID),
        limit(1)
      );
      const storeSnapshot = await getDocs(storeQuery);
      const store = storeSnapshot.docs.map((store) => {
        const storeData = store.data();
        return {
          storeId: store.id,
          storeInfo: storeData['storeInfo'],
          storeStatus: storeData['storeStatus'],
        } as storeData;
      });
      console.log('Store catch: ', store);
      return store[0];
    } catch (error) {
      console.log('Error catching Store: ', error);
      throw error;
    }
  }

  /**
   * @returns all stores.
   */
  async getAllStores(): Promise<storeData[]> {
    try {
      const storeQuery = query(
        collection(this.FIREBASE_DB, 'stores'),
        where('storeStatus.statusCondition', '==', true)
      );
      const storeSnapshot = await getDocs(storeQuery);
      const stores = storeSnapshot.docs.map((store) => {
        const storeInfo = store.data();
        return {
          storeId: store.id,
          storeInfo: storeInfo['storeInfo'],
          storeStatus: storeInfo['storeStatus'],
        } as storeData;
      });
      console.log('Stores catch: ', stores);
      return stores;
    } catch (error) {
      console.log('Error catching store: ', error);
      throw error;
    }
  }

  /**
   * @param userUID
   * @returns cita de usuario con solo el userUID.
   */
  async getUserDate(userUID: string): Promise<dateData> {
    try {
      const dateRef = collection(this.FIREBASE_DB, 'cita');
      const fechaHoy = new Date().toISOString().split('T')[0];
      console.log(fechaHoy);
      const dateQuery = query(
        dateRef,
        where('cita.idUsuario', '==', userUID),
        where('cita.fechaSeleccionada', '==', fechaHoy),
        where('cita.status', '==', 'activa'),
        limit(1)
      );
      const dateSnapshot = await getDocs(dateQuery);
      const date = dateSnapshot.docs.map((doc) => {
        const dateData = doc.data();
        return {
          dateId: doc.id,
          dateData: dateData['cita'],
        } as dateData;
      });
      console.log('cita obtenida: ', date);
      return date[0];
    } catch (error) {
      console.log('Error obteniendo cita: ', error);
      throw error;
    }
  }

  /**
   * @param serviceId
   * @returns nombre del servicio esperado.
   */
  async getServiceName(serviceId: string): Promise<string | null> {
    try {
      if (!serviceId) throw new Error('serviceId are required.');
      const serviceRef = doc(this.FIREBASE_DB, 'service', serviceId);
      const serviceSnapshot = await getDoc(serviceRef);
      if (!serviceSnapshot.exists())
        throw new Error('Este servicio no existe.');
      const serviceName =
        serviceSnapshot.data()?.['serviceData']?.['nombreServicio'];
      return serviceName;
    } catch (error) {
      console.log('Error catching service name: ', error);
      throw error;
    }
  }

  /**
   * @param storeId
   * @returns servicios de la tienda
   */
  async getServicesByStoreId(storeId: string): Promise<serviceData[]> {
    try {
      const serviceQuery = query(
        collection(this.FIREBASE_DB, 'service'),
        where('serviceData.storeId', '==', storeId)
      );
      const serviceSnapshot = await getDocs(serviceQuery);
      const serviceStore = serviceSnapshot.docs.map((doc) => {
        const serviceData = doc.data();
        return {
          serviceId: doc.id,
          serviceData: serviceData['serviceData'],
        } as serviceData;
      });
      console.log('Services catch: ', serviceStore);
      return serviceStore;
    } catch (error) {
      console.log('Error catching services: ', error);
      throw error;
    }
  }

  /**
   * @param serviceId
   * @returns trae servicio en base a su ID
   */
  async getServiceById(serviceId: string): Promise<serviceData> {
    try {
      const serviceRef = doc(this.FIREBASE_DB, 'service', serviceId);
      const serviceSnapshot = await getDoc(serviceRef);
      if (!serviceSnapshot.exists()) {
        throw new Error('El servicio no existe');
      }
      const serviceData = serviceSnapshot.data();
      return {
        serviceId: serviceSnapshot.id,
        serviceData: serviceData['serviceData'],
      } as serviceData;
    } catch (error) {
      console.log('error catching service: ', error);
      throw error;
    }
  }

  //Updatings

  /**
   * @param uid
   * @param userInfo
   * Funcion para actualizar la informacion del usuario, necesaria.
   */
  async updateUser(uid: string, userInfo: userInfo): Promise<void> {
    try {
      const userRef = doc(this.FIREBASE_DB, 'users', uid);
      await updateDoc(userRef, { userInfo });
      console.log('✅ User updated:', uid);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  /**
   * @param uid
   * @param tipe
   * Con estos dos parametros se actuliza el usuario a administrador.
   */
  async updateUserTipe(uid: string, tipe: string): Promise<void> {
    const userDocRef = doc(this.FIREBASE_DB, 'users', uid);
    try {
      await updateDoc(userDocRef, { 'userInfo.tipe': tipe });
      console.log('user successfully updated!');
    } catch (error) {
      console.error('Error updating user: ', error);
      throw error;
    }
  }

  /**
   * @param serviceId
   * @param serviceData
   * Funcion para actualizar servicios.
   */
  async updateService(serviceId: string, serviceData: service): Promise<void> {
    try {
      const serviceRef = doc(this.FIREBASE_DB, 'service', serviceId);
      await updateDoc(serviceRef, { serviceData });
      console.log('✅ Service updated:', serviceId);
    } catch (error) {
      console.error('❌ Error updating service:', error);
      throw error;
    }
  }

  /**
   * @param storeId
   * @param storeData
   * Funcion para actualizar tienda.
   */
  async updateStore(storeId: string, storeInfo: storeInfo): Promise<void> {
    try {
      const storeRef = doc(this.FIREBASE_DB, 'stores', storeId);
      await updateDoc(storeRef, { storeInfo });
      console.log('✅ Store updated:', storeId);
    } catch (error) {
      console.error('❌ Error updating store:', error);
      throw error;
    }
  }

  async updateStoreStatus(
    storeId: string,
    storeStatus: storeStatus
  ): Promise<void> {
    try {
      const storeRef = doc(this.FIREBASE_DB, 'stores', storeId);
      await updateDoc(storeRef, { storeStatus });
      console.log('✅ Store updated:', storeId);
    } catch (error) {
      console.error('❌ Error updating store status:', error);
      throw error;
    }
  }

  //All Delets
  /**
   * @param serviceId
   * Funcion para eliminar un servicio en base a su id
   */
  async deleteService(serviceId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.FIREBASE_DB, 'service', serviceId));
      console.log('✅ Servicio eliminado:', serviceId);
    } catch (error) {
      console.error('❌ Error eliminar servicio:', error);
      throw error;
    }
  }

  /**
   * @param storeId
   * con solo este parametro se eliminaran los datos de la tienda
   */
  async deleteStore(storeId: string): Promise<void> {
    try {
      const serviceQuery = query(
        collection(this.FIREBASE_DB, 'service'),
        where('serviceData.storeId', '==', storeId)
      );
      const serviceSnapshot = await getDocs(serviceQuery);
      const deleteServicePromise = serviceSnapshot.docs.map((serviceDoc) => {
        this.deleteService(serviceDoc.id);
      });
      await Promise.all(deleteServicePromise);
      console.log(
        `✅ ${serviceSnapshot.docs.length} deleted service to store: ${storeId}`
      );
      const storeRef = doc(this.FIREBASE_DB, 'stores', storeId);
      await deleteDoc(storeRef);
      console.log('✅ Store deleted: ', storeId);
    } catch (error) {
      console.error('❌ Error deleting store:', error);
      throw error;
    }
  }
}
