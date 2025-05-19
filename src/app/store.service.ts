import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { UserData, UserStoreData } from './store';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  constructor(private store: AngularFirestore) {}

  //Funcion para crear datos del usuario, se almacena un array.
  async createUserInfo(UID: string, userInfo: any): Promise<void> {
    try {
      if (!UID || !userInfo) {
        throw new Error('UID and userInfo are required');
      }

      const userDoc: AngularFirestoreDocument<any> = this.store.doc(
        `users/${UID}`
      ); // Corrected path
      await userDoc.set({ userInfo });
      console.log('User info created successfully');
    } catch (error) {
      console.error('Error creating user info:', error);
      throw error;
    }
  }

  //Función para crear datos de la tienda según el UID del usuario.
  async createUserStore(userUID: string, storeInfo: any): Promise<void> {
    try {
      if (!userUID || !storeInfo) {
        throw new Error('Toda la información es requerida.');
      }

      //Creamos un storeId en el mismo codigo
      const storeId = `${Date.now()}_${userUID}`;

      const storeDoc: AngularFirestoreDocument<any> = this.store.doc(
        `stores/${storeId}`
      ); // Corrected path
      await storeDoc.set({ userUID: userUID, storeInfo: storeInfo });
      console.log('User Store created successfully!');
    } catch (error) {
      //Manejo de errores
      console.error('Error creating store info: ', error);
      throw error;
    }
  }

  //Función para llamar los datos de un usuario
  getUserData(uid: string): Observable<UserData> {
    try {
      if (!uid) throw new Error('No UID provided');

      const userDoc: AngularFirestoreDocument<any> = this.store.doc(
        `users/${uid}`
      );
      return userDoc.valueChanges().pipe(
        map((doc) => {
          if (!doc) {
            return {
              UID: uid,
              userInfoData: {
                name: '',
                lastName: '',
                rut: '',
                tipe: '',
              },
            };
          }

          return {
            UID: uid,
            userInfoData: doc.userInfo || {
              name: '',
              lastName: '',
              rut: '',
              tipe: '',
            },
          };
        })
      );
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  getStoreByUID(uid: string): Observable<UserStoreData> {
    try {
      if (!uid) {
        throw new Error('No UID provided');
      }

      const storesCollection: AngularFirestoreCollection<any> =
        this.store.collection('stores', (ref) =>
          ref.where('userUID', '==', uid).limit(1)
        );

      return storesCollection.snapshotChanges().pipe(
        map((actions) => {
          if (actions.length === 0) {
            return {
              userUID: uid,
              storeInfo: {
                bussinessName: '',
                direction: '',
                categories: [],
              },
            };
          }

          const action = actions[0];
          const data = action.payload.doc.data();

          return {
            userUID: uid,
            storeInfo: data.storeInfo || {
              bussinessName: '',
              direction: '',
              categories: [],
            },
          };
        })
      );
    } catch (error) {
      console.error('Error getting store data:', error);
      return from(Promise.reject(error)); // Convert error to Observable
    }
  }
}
