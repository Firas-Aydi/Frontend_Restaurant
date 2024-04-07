// map.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  restaurants: any[] | undefined;
  map: any;
  count = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initializeMap();
    this.fetchRestaurants();
  }

  fetchRestaurants(): void {
    this.http.get<any[]>('http://localhost:5000/').subscribe((restaurants) => {
      this.restaurants = restaurants;
      console.log(this.restaurants); // Vérifiez la console pour voir si les données sont récupérées avec succès

      // Appel à la fonction de mise à jour une fois que les données sont récupérées
      this.updateMapWithReviews();
    });
  }

  initializeMap(): void {
    this.map = L.map('map').setView([38.6685955, -90.2654703], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);
  }

  updateMapWithReviews(): void {
    const restaurants = this.restaurants;
    if (restaurants) {
      for (const restaurant of restaurants) {
        let TerribleReviews = 0;
        let PoorReviews = 0;
        let AverageReviews = 0;
        let GoodReviews = 0;
        let ExcellentReviews = 0;

        for (const review of restaurant.reviews) {
          this.http
            .post<any>('http://localhost:5000/predict_sentiment', {
              text: review.text,
            })
            .subscribe((data) => {
              switch (data.sentiment) {
                case 'Terrible':
                  TerribleReviews++;
                  break;
                case 'Poor':
                  PoorReviews++;
                  break;
                case 'Average':
                  AverageReviews++;
                  break;
                case 'Very good':
                  GoodReviews++;
                  break;
                case 'Excellent':
                  ExcellentReviews++;
                  break;
              }

              let popupContent = `<b>${restaurant.name}</b><br>
                                ${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.postal_code}<br>
                                Stars: ${restaurant.stars}<br>`;
              popupContent += `<div style='color:green;'><b>Excellent reviews: ${ExcellentReviews}</b></div>`;
              popupContent += `<div style='color:blue;'><b>Very good reviews: ${GoodReviews}</b></div>`;
              popupContent += `<div style='color:yellow;'><b>Average reviews: ${AverageReviews}</b></div>`;
              popupContent += `<div style='color:orange;'><b>Poor reviews: ${PoorReviews}</b></div>`;
              popupContent += `<div style='color:red;'><b>Terrible reviews: ${TerribleReviews}</b></div>`;
              popupContent += `<br><b>Reviews:</b><br>`;
              for (const review of restaurant.reviews) {
                const truncatedText =
                  review.text.length > 100
                    ? review.text.substring(0, 100) + '...'
                    : review.text;
                popupContent += truncatedText + '<br><br>';
              }

              const popupOptions = {
                maxHeight: 300,
              };

              L.marker([restaurant.latitude, restaurant.longitude])
                .addTo(this.map)
                .bindPopup(popupContent, popupOptions);
              this.count = this.count + 1;
              console.log('count:', this.count,restaurant.name);
            });
        }
      }
    }
  }
}
