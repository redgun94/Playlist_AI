import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  artistsSignal = signal<any[]>([]);

  constructor() { 
    // Recuperar datos desde localStorage
    const storageData = JSON.parse(localStorage.getItem('artists') || '{}');

    // Verificar que `storageData` tenga la propiedad `expiry` y que no haya expirado
    if (storageData && storageData.expiry && storageData.expiry > Date.now()) {
      const dataArray = Array.isArray(storageData.data) ? [...storageData.data] : storageData.data;
      this.artistsSignal.update(values => {return [...values,dataArray]});  
      
      console.log("Artistas recuperados desde localStorage:", this.artistsSignal());
    } else {
      console.warn("Los datos han expirado o no existen. Limpiando almacenamiento...");
      localStorage.removeItem('artists');
      this.artistsSignal.set([]);
    }
  }

  // Método para actualizar y guardar artistas en localStorage
  updateArtists(newArtist: any) {
    this.artistsSignal.update(values => {return [...values,newArtist]}); // ✅ Actualiza la Signal con los nuevos artistas
    const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // ✅ Expira en 24 horas
    localStorage.setItem('artists', JSON.stringify({ data: this.artistsSignal(), expiry: expiryTime })); // ✅ Guarda correctamente en localStorage
    console.log("Artistas guardados en localStorage:", this.artistsSignal());

  }

  cleanLocalStorage(){
    localStorage.removeItem('artists');
    this.artistsSignal.set([]);  
  }
  updateSharedDataValue(artist:any){
    this.artistsSignal.set(artist);
  }
}
