import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface PlatData {
  id: '';
  name: any;
  image: any;
  price: any;
  uid: any;
}

@Component({
  selector: 'app-plat',
  templateUrl: './plat.component.html',
  styleUrls: ['./plat.component.css'],
})
export class PlatComponent implements OnInit {
  Uid: string = '';
  dataPlat: PlatData = { id: '', name: '', image: '', price: '', uid: '' };
  selectedPlatId: string | undefined;
  successMessage: string = '';
  successUpdate: string = '';
  errorMessage: string = '';
  dataArray: { id: string; name: any; image: any; price: any; uid: any }[] = [];
  getPlats: Subscription = new Subscription();
  filteredDataArray: {
    id: string;
    name: any;
    image: any;
    price: any;
    uid: any;
  }[] = [];
  platModalRef: any;

  constructor(
    private fs: AngularFirestore,
    private as: AuthService,
    // private modalService: NgbModal
  ) {
    this.as.user.subscribe((user) => {
      if (user) {
        this.Uid = user.uid;
      }
    });
  }

  ngOnInit(): void {
    this.getPlats = this.fs
      .collection('plats')
      .snapshotChanges()
      .subscribe((data) => {
        this.dataArray = data.map((element) => {
          const docData = element.payload.doc.data() as PlatData;
          return {
            id: element.payload.doc.id,
            name: docData.name,
            image: docData.image,
            price: docData.price,
            uid: docData.uid,
          };
        });
        this.filteredDataArray = this.dataArray.filter(
          (item) => this.Uid === item.uid
        );
      });
  }

  addPlat(f: { value: any }) {
    let data = f.value;

    this.fs
      .collection('plats')
      .add({
        name: data.name,
        image: data.image,
        price: data.price,
        uid: this.Uid,
      })
      .then(() => {
        this.successMessage = 'added !';
        // console.log(this.Uid);
        window.location.reload();

      })
      .catch((error) => {
        console.error('Error adding plat:', error);
        this.errorMessage = 'Failed to add menu. Please try again.';
      });
  }

  Update(platId: string | undefined) {
    if (platId) {
      this.fs
        .collection('plats')
        .doc(platId)
        .update({
          name: this.dataPlat.name,
          image: this.dataPlat.image,
          price: this.dataPlat.price,
          uid: this.Uid,
        })
        .then(() => {
          this.successUpdate = 'updated!';
          window.location.reload();
        });
    }
  }
  setPlatData(item: any) {
    this.dataPlat = {
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      uid: item.uid,
    };
  }

  ngOnDestroy() {
    this.getPlats.unsubscribe();
    console.log('done on destroy');
  }

  delete(id: string | undefined) {
    this.selectedPlatId = id;
  }

  confirmDelete() {
    if (this.selectedPlatId) {
      this.fs
        .collection('plats')
        .doc(this.selectedPlatId)
        .delete()
        .then(() => {
          console.log('Plat deleted successfully!');
          this.selectedPlatId = undefined; // Réinitialise selectedPlatId
          this.successUpdate = 'Plat deleted successfully!';
          window.location.reload(); // Recharge la page ou utilisez une autre méthode pour mettre à jour la liste
        })
        .catch((error) => {
          console.error('Error deleting plat:', error);
        });
    }

    document.getElementById('deleteModal')?.click(); // Ferme la modal
  }
  isCurrentUserPlat(itemUid: string): boolean {
    return this.Uid === itemUid;
  }
}
