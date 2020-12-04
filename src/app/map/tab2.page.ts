import {Component, ElementRef, ViewChild} from '@angular/core';

declare var google: any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  map: any;
  infoWindow: any;
  marker: any;

  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;
  constructor() {}

  umnPos: unknown = {
    lat: -6.256081,
    lng: 106.618755,
  };

  ionViewDidEnter() {
    this.initMap(this.umnPos);
  }

  initMap(pos: any) {
    console.log('ay');
    const location = new google.maps.LatLng(pos.lat, pos.lng);
    const options = {
      center: location,
      zoom: 10,
      disableDefaultUI: true,
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, options);

    // Create the initial InfoWindow
    this.infoWindow = new google.maps.InfoWindow({
      content: `Click the map to locate the contact's house`,
      position: this.umnPos,
    });
    this.infoWindow.open(this.map);

    this.marker = new google.maps.Marker({
      position: this.umnPos,
      map: this.map,
    });

    // Configure the click listener
    this.map.addListener('click', (mapsMouseEvent) => {
      // close current infowindow
      this.infoWindow.close();
      // Positioning marker according to the cursor
      this.marker.setPosition(mapsMouseEvent.latLng);
      // Setting the location value
      // this.location = mapsMouseEvent.latLng.toJSON();
    });
  }

}
