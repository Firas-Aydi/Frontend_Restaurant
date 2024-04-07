// menu.component.ts
import { firestore } from 'firebase/app';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface MenuData {
  id: string;
  plats: any[];
  jour: Date;
  uid: any;
}

interface PlatData {
  id: string;
  name: string;
  image: any;
  price: any;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  Uid: string = '';
  dataMenus: MenuData[] = [];
  getMenus: Subscription = new Subscription();
  menuItems: MenuData[] = [];
  // menuJour: string = '';
  menuJour: Date = new Date();

  selectedPlats: { [key: string]: boolean } = {};
  userPlats: PlatData[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  userPlatsForUpdate: PlatData[] = [];
  filteredDataMenus: { id: string; jour: Date; plats: PlatData[]; uid: any }[] =
    [];
  selectedMenuItemId: string | undefined;

  constructor(
    private fs: AngularFirestore,
    private as: AuthService,
    private modalService: NgbModal
  ) {
    this.as.user.subscribe((user) => {
      if (user) {
        this.Uid = user.uid;
      }
    });
  }

  ngOnInit(): void {
    this.getMenus = this.fs
      .collection('menus')
      .snapshotChanges()
      .subscribe((data) => {
        this.dataMenus = data.map((element) => {
          const docData = element.payload.doc.data() as MenuData;
          return {
            id: element.payload.doc.id,
            jour: docData.jour,
            plats: docData.plats,
            uid: docData.uid,
          };
        });
        this.filteredDataMenus = this.dataMenus.filter(
          (item) => this.Uid === item.uid
        );
      });
  }

  ngOnDestroy() {
    this.getMenus.unsubscribe();
    console.log('Done on destroy');
  }

  openAddMenuModal() {
    this.fs
      .collection('plats', (ref) => ref.where('uid', '==', this.Uid))
      .snapshotChanges()
      .pipe(take(1))
      .subscribe(
        (data) => {
          this.userPlats = data.map((element) => {
            const docData = element.payload.doc.data() as PlatData;
            return {
              id: element.payload.doc.id,
              name: docData.name,
              image: docData.image,
              price: docData.price,
            };
          });
          console.log(this.userPlats);

          this.modalService.open({ ariaLabelledBy: 'addMenuModelLabel' });
        },
        (error) => {
          console.error('Error fetching plats:', error);
        }
      );
  }

  addMenuItem(f: any) {
    const selectedPlatsData = this.userPlats
      .filter((plat) => this.selectedPlats[plat.id])
      .map((plat) => ({
        id: plat.id,
        name: plat.name,
        image: plat.image,
        price: plat.price,
      }));

    this.fs
      .collection('menus')
      .add({
        jour: this.menuJour,
        plats: selectedPlatsData,
        uid: this.Uid,
      })
      .then(() => {
        this.selectedPlats = {}; // Assuming selectedPlats is an object
        this.successMessage = 'Menu added !';
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error adding menu:', error);
        this.errorMessage = 'Failed to add menu. Please try again.';
      });
  }

  updateDate(item: MenuData) {
    // Charger tous les plats de l'utilisateur
    this.fs
      .collection('plats', (ref) => ref.where('uid', '==', this.Uid))
      .snapshotChanges()
      .pipe(take(1))
      .subscribe(
        (data) => {
          // Récupérer tous les plats de l'utilisateur
          const allUserPlats = data.map((element) => {
            const docData = element.payload.doc.data() as PlatData;
            return {
              id: element.payload.doc.id,
              name: docData.name,
              image: docData.image,
              price: docData.price,
            };
          });

          // Définir la date du menu et les plats sélectionnés
          this.menuJour = item.jour;
          this.selectedPlats = {};
          item.plats.forEach((plat) => {
            this.selectedPlats[plat.id] = true;
          });

          // Créer une copie de la liste allUserPlats pour l'affichage dans le formulaire
          this.userPlatsForUpdate = [...allUserPlats];
          // Déboguer tous les plats de l'utilisateur
          console.log('userPlats:', this.userPlatsForUpdate);

          // Ouvrir le modèle de mise à jour après avoir chargé les plats
          this.selectedMenuItemId = item.id;
          this.modalService.open({ ariaLabelledBy: 'updateMenuModelLabel' });
        },
        (error) => {
          console.error('Error fetching plats:', error);
        }
      );
  }

  updateDateMenu() {
    // Update seulement la date du menu en utilisant le selectedMenuItemId
    if (this.selectedMenuItemId) {
      this.fs
        .collection('menus')
        .doc(this.selectedMenuItemId)
        .update({
          jour: this.menuJour,
        })
        .then(() => {
          this.successMessage = 'Menu date updated!';
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error updating menu date:', error);
          this.errorMessage = 'Failed to update menu date. Please try again.';
        });
    }
    // Fermer le modal après la mise à jour
    this.modalService.dismissAll();
  }
  addPlatToMenu(item: MenuData) {
    // Charger tous les plats de l'utilisateur
    this.fs
      .collection('plats', (ref) => ref.where('uid', '==', this.Uid))
      .snapshotChanges()
      .pipe(take(1))
      .subscribe(
        (data) => {
          // Récupérer tous les plats de l'utilisateur
          const allUserPlats = data.map((element) => {
            const docData = element.payload.doc.data() as PlatData;
            return {
              id: element.payload.doc.id,
              name: docData.name,
              image: docData.image,
              price: docData.price,
            };
          });

          // Filtrer les plats liés au menu actuel
          this.userPlats = allUserPlats.filter(
            (plat) =>
              !item.plats.some(
                (menuPlat) => menuPlat.id === plat.id
                // //  ||
                // menuPlat.id !== plat.id
              )
          );

          // Définir la date du menu et les plats sélectionnés
          this.menuJour = item.jour;
          this.selectedPlats = {};
          item.plats.forEach((plat) => {
            this.selectedPlats[plat.id] = true;
          });

          // Créer une copie de la liste userPlats pour l'affichage dans le formulaire
          this.userPlatsForUpdate = [...this.userPlats];
          // Déboguer les plats de l'utilisateur liés au menu actuel
          console.log('userPlatsForUpdate:', this.userPlatsForUpdate);

          // Ouvrir le modèle de mise à jour après avoir chargé les plats
          this.selectedMenuItemId = item.id;
          this.modalService.open({ ariaLabelledBy: 'updateMenuModelLabel' });
        },
        (error) => {
          console.error('Error fetching plats:', error);
        }
      );
  }

  // addPlatToMenu(item: MenuData) {
  //   // Charger tous les plats de l'utilisateur
  //   this.fs
  //     .collection('plats', (ref) => ref.where('uid', '==', this.Uid))
  //     .snapshotChanges()
  //     .pipe(take(1))
  //     .subscribe(
  //       (data) => {
  //         // Récupérer tous les plats de l'utilisateur
  //         const allUserPlats = data.map((element) => {
  //           const docData = element.payload.doc.data() as PlatData;
  //           return {
  //             id: element.payload.doc.id,
  //             name: docData.name,
  //             image: docData.image,
  //             price: docData.price,
  //           };
  //         });

  //         // Filtrer les plats qui ne sont pas déjà dans le menu
  //         const availablePlats = allUserPlats.filter((plat) => !item.plats.some((menuPlat) => menuPlat.id === plat.id));

  //         // Mise à jour des plats pour l'ajout
  //         this.userPlatsForUpdate = [...availablePlats];

  //         // Déboguer les plats disponibles pour ajout
  //         console.log('Available Plats:', this.userPlatsForUpdate);

  //         // Ouvrir le modèle d'ajout de plat au menu
  //         this.selectedMenuItemId = item.id;
  //         this.modalService.open({ ariaLabelledBy: 'updateMenuModelLabel' });
  //       },
  //       (error) => {
  //         console.error('Error fetching plats:', error);
  //       }
  //     );
  // }

  AddPlat() {
    // Filtrer les plats sélectionnés
    const selectedPlatsData = this.userPlatsForUpdate
      .filter((plat) => this.selectedPlats[plat.id])
      .map((plat) => ({
        id: plat.id,
        name: plat.name,
        image: plat.image,
        price: plat.price,
      }));

    // Ajouter les nouveaux plats sélectionnés au menu en utilisant le selectedMenuItemId
    if (this.selectedMenuItemId) {
      firestore()
        .collection('menus')
        .doc(this.selectedMenuItemId)
        .update({
          plats: firestore.FieldValue.arrayUnion(...selectedPlatsData),
        })
        .then(() => {
          this.selectedPlats = {}; // Réinitialiser les plats sélectionnés
          this.successMessage = 'Plats added to menu!';
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error adding plats to menu:', error);
          this.errorMessage = 'Failed to add plats to menu. Please try again.';
        });
    }

    // Fermer le modèle après l'ajout
    this.modalService.dismissAll();
  }

  deleteMenuItem(itemId: string) {
    this.selectedMenuItemId = itemId;
  }

  confirmDelete() {
    if (this.selectedMenuItemId) {
      this.fs
        .collection('menus')
        .doc(this.selectedMenuItemId)
        .delete()
        .then(() => {
          console.log('Menu deleted successfully!');
          this.selectedMenuItemId = undefined;
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error deleting menu:', error);
        });
    }

    this.modalService.dismissAll(); // Close the confirmation modal
  }

  removePlatFromMenu(menuId: string, platId: string) {
    // Mettez en œuvre la logique de suppression du plat du menu
    const menuRef = this.fs.collection('menus').doc(menuId);
    
    // Obtenez le menu actuel
    menuRef.get().toPromise().then((menuSnapshot) => {
      if (menuSnapshot.exists) {
        // Supprimez le plat du tableau des plats dans le menu
        const updatedPlats = menuSnapshot.data()?.plats.filter((plat: any) => plat.id !== platId);

        // Mettez à jour le menu avec les plats mis à jour
        menuRef.update({ plats: updatedPlats })
          .then(() => {
            console.log(`Plat ${platId} removed from menu ${menuId}`);
          })
          .catch((error) => {
            console.error('Error removing plat from menu:', error);
          });
      }
    });
  }
}
