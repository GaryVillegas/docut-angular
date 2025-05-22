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
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserData, UserStoreData } from './types/store';
import { UserInfoPage } from './user-info/user-info.page';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  constructor(private firestore: Firestore) {}

  // Function to create user data, stores an array
  async createUserInfo(UID: string, userInfo: any): Promise<void> {
    try {
      if (!UID || !userInfo) {
        throw new Error('UID and userInfo are required');
      }

      await setDoc(doc(this.firestore, 'users', UID), {
        userInfo,
      });
      console.log('User info created successfully');
    } catch (error) {
      console.error('Error creating user info:', error);
      throw error;
    }
  }

  // Function to create store data according to user UID
  async createUserStore(userUID: string, storeInfo: any): Promise<void> {
    try {
      if (!userUID || !storeInfo) {
        throw new Error('All information is required');
      }

      // Create a storeId in the code
      const storeId = `${Date.now()}_${userUID}`;

      await setDoc(doc(this.firestore, 'stores', storeId), {
        userUID: userUID,
        storeInfo: storeInfo,
      });
      console.log('User Store created successfully!');
    } catch (error) {
      // Error handling
      console.error('Error creating store info: ', error);
      throw error;
    }
  }

  // Function to get user data
  getUserData(uid: string): Observable<UserData> {
    try {
      if (!uid) throw new Error('No UID provided');

      const userDocRef = doc(this.firestore, 'users', uid);
      return from(getDoc(userDocRef)).pipe(
        map((userDoc) => {
          if (!userDoc.exists()) {
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
            userInfoData: userDoc.data()?.['userInfo'] || {
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
      if (!uid) throw new Error('No UID provided');

      const q = query(
        collection(this.firestore, 'stores'),
        where('userUID', '==', uid),
        limit(1)
      );

      return from(getDocs(q)).pipe(
        map((querySnapshot) => {
          if (querySnapshot.empty) {
            return {
              userUID: uid,
              storeInfo: {
                bussinessName: '',
                direction: '',
                categories: [],
              },
            };
          }

          const storeDoc = querySnapshot.docs[0];
          return {
            userUID: uid,
            storeInfo: storeDoc.data()?.['storeInfo'] || {
              bussinessName: '',
              direction: '',
              categories: [],
            },
          };
        })
      );
    } catch (error) {
      console.error('Error getting store data:', error);
      throw error;
    }
  }

  async updateUserType(uid: string) {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      await updateDoc(userDocRef, {
        'userInfo.tipe': 'administrador', // Corregido de 'UserInfoPage.tipe' a 'userInfo.tipe'
      });
      console.log('Tipo de usuario actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar el tipo de usuario: ', error);
      throw error;
    }
  }
}
