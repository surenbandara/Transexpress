import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderType } from './Model';
import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';
import firestore from '@react-native-firebase/firestore';
import dotenv from 'dotenv';


export class DbUtils {
  
  constructor(private db: any) {
    this.createTable();
  }

  private createTable(): void {
    this.db.transaction((tx: any) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Orders (
          id TEXT PRIMARY KEY,
          COD INTEGER,
          address TEXT,
          date TEXT,
          name TEXT,
          numbers INTEGER,
          orderType TEXT,
          notes TEXT,
          photo TEXT,
          updatedAt INTEGER,
          rejectReason TEXT
        )`,
        [],
        () => console.log('Orders table created successfully'),
        (error : Error) => console.error('Error creating Orders table', error)
      );
    });
  }

  public async storeImage(imageBase64: string, imageName: string): Promise<string | null> {
    try {
      if (!imageBase64) {
        console.error('No image data provided');
        return null;
      }
  

      const path = `${RNFS.DocumentDirectoryPath}/${imageName}.jpg`;
      await RNFS.writeFile(path, imageBase64, 'base64');
  
      console.log('Image saved successfully at:', path);
      return path;
    } catch (error) {
      console.error('Error saving the image:', error);
      return null;
    }
  }

  public async saveOrder(order: Order): Promise<void> {
    const { id, COD, address, date, name, numbers, orderType, notes, photo, rejectReason, updatedAt } = order;
    return new Promise((resolve, reject) => {
      this.db.transaction((tx : any) => {
        tx.executeSql(
          `INSERT INTO Orders (id, COD, address, date, name, numbers, orderType, notes, photo, rejectReason, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, COD, address, date, name, JSON.stringify(numbers), orderType, notes, photo, rejectReason, updatedAt],
          () => resolve(),
          (_, error : Error) => reject(error)
        );
      });
    });
  }

  public async saveOrders(orders: Order[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx : any) => {
        orders.forEach(order => {
          const { id, COD, address, date, name, numbers, orderType, notes, photo, rejectReason, updatedAt } = order;
          tx.executeSql(
            `INSERT INTO Orders (id, COD, address, date, name, numbers, orderType, notes, photo, rejectReason, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, COD, address, date, name, JSON.stringify(numbers), orderType, notes, photo, rejectReason, updatedAt],
            undefined,
            (_, error : Error) => reject(error)
          );
        });
      },
      (error : Error) => {console.log(error);reject(error);},
      () => resolve());
    });
  }

  public async getAllOrders(): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx :any)=> {
        tx.executeSql(
          `SELECT * FROM Orders`,
          [],
          (_: any, results: any) => {
            const rows: { length: number; item: (index: number) => any } = results.rows;
            const orders: Order[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              orders.push({
                id: row.id,
                COD: row.COD,
                address: row.address,
                date: row.date,
                name: row.name,
                numbers: JSON.parse(row.numbers),
                orderType: row.orderType as OrderType,
                updatedAt: row.updatedAt,
                ...row.notes && { notes: row.notes }, 
                ...row.photo && { photo: row.photo },  
                ...row.rejectReason && { rejectReason: row.rejectReason }
              });
            }
            resolve(orders);
          },
          (_, error : Error) => reject(error)
        );
      });
    });
  }
  public async updateOrder(id: string, updatedOrder: Order): Promise<void> {
    return new Promise((resolve, reject) => {
        this.db.transaction((tx: any) => {
    
            const fields = Object.keys(updatedOrder).filter(key => key !== 'id') as (keyof Order)[];
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = fields.map(field => field === 'numbers' ? JSON.stringify(updatedOrder[field]) : updatedOrder[field]);
            values.push(id);

            const sql = `UPDATE Orders SET ${setClause} WHERE id = ?`;

            tx.executeSql(
                sql,
                values,
                () => resolve(),
                (_, error: Error) => reject(error)
            );
        });
    });
  }

  public async deleteAllOrdersAndImages(): Promise<void> {
    await this.deleteAllOrders();
    await this.deleteAllImages();
  }

  private async deleteAllOrders(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx : any) => {
        tx.executeSql(
          `DELETE FROM Orders`,
          [],
          () => resolve(),
          (_, error : Error) => reject(error)
        );
      });
    });
  }

  public async deleteOrder(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          `DELETE FROM Orders WHERE id = ?`,
          [id],
          () => resolve(),
          (_, error: Error) => reject(error)
        );
      });
    });
  }

  private async deleteAllImages(): Promise<void> {
    try {
    
      const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      const imageFiles = files.filter(file => file.name.endsWith('.jpg'));
  
      for (const file of imageFiles) {
        await RNFS.unlink(file.path);
        console.log(`Deleted: ${file.path}`);
      }
  
      console.log('All images deleted successfully.');
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  }

}

export namespace FireStoreService {
  
  export async function create(collectionName: string, data: any): Promise<string | void> {
    try {
      const docRef = await firestore()
        .collection(collectionName)
        .add(data);
      console.log(`Document created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('Error creating document: ', error);
    }
  }

  export async function createOrUpdate(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      await firestore()
        .collection(collectionName)
        .doc(docId)
        .set(data, { merge: true }); 
      console.log(`${docId} document successfully written to ${collectionName}!`);
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  }

  export async function get(collectionName: string, docId: string): Promise<any | null> {
    try {
      const documentSnapshot = await firestore()
        .collection(collectionName)
        .doc(docId)
        .get();

      if (documentSnapshot.exists) {
        console.log('Document data:', documentSnapshot.data());
        return documentSnapshot.data();
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting document: ', error);
      return null;
    }
  }

  export async function getAll(collectionName: string): Promise<any[]> {
    try {
      const querySnapshot = await firestore()
        .collection(collectionName)
        .get();

      const allDocuments: any[] = [];
      querySnapshot.forEach(documentSnapshot => {
        allDocuments.push({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        });
      });

      console.log(`Retrieved ${allDocuments.length} documents from ${collectionName}`);
      return allDocuments;
    } catch (error) {
      console.error('Error getting documents: ', error);
      return [];
    }
  }

  export async function update(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      await firestore()
        .collection(collectionName)
        .doc(docId)
        .update(data);
      console.log(`Document ${docId} successfully updated in ${collectionName}`);
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  }
}



export const dbUtils = new DbUtils(SQLite.openDatabase({ name: 'transexpressriderdatabase.db', location: 'default' }));

  
