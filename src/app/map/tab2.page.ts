import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FriendsService } from '../services/friends.service';
import { PlacesService } from '../services/places.service';
import { AuthService } from '../services/auth.service';
import {ToastController} from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  form: FormGroup;
  currUid: string;
  manualCheckIn = false;

  geocoder: any;
  map: any;
  infoWindow: any;
  marker: any;
  pos: { lat: number; lng: number } = {
    lat: -6.256081,
    lng: 106.618755,
  };

  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private authSrv: AuthService,
    private friendsSrv: FriendsService,
    private placesSrv: PlacesService,
    private toastCtrl: ToastController,
  ) {}
  ngOnInit() {
    this.currUid = this.authSrv.getCurrentUserDetail().uid;
    this.form = this.formBuilder.group({
      name: new FormControl('', Validators.required),
    });
  }

  ionViewDidEnter() {
    this.initMap(this.pos);
  }

  toogleManualCheckIn() {
    this.manualCheckIn = !this.manualCheckIn;
  }

  initMap(pos: any) {
    const location = new google.maps.LatLng(pos.lat, pos.lng);
    const options = {
      center: location,
      zoom: 15,
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, options);
    this.geocoder = new google.maps.Geocoder();

    this.marker = new google.maps.Marker({
      position: this.pos,
      map: this.map,
      label: 'You',
    });

    // Configure the click listener
    this.map.addListener('click', (mapsMouseEvent) => {
      if (this.manualCheckIn) {
        this.marker.setPosition(mapsMouseEvent.latLng);
        this.pos = mapsMouseEvent.latLng.toJSON();
      }
    });

    this.recenter();
  }

  recenter() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: Position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.pos = pos;
        this.map.setCenter(pos);
      });
      this.marker.setPosition(this.pos);
    }
  }

  async checkIn() {
    if (this.form.invalid) {
      this.geocodePlaceId();
      return;
    }
    const { name } = this.form.value;
    const res = await this.placesSrv.checkIn(this.currUid, {
      ...this.pos,
      name,
    });

    if (res.success) {
      this.presentToast(`You've been pinned!`, 'success');
      return;
    }
    this.presentToast(`We can't track you. Please try again.`, 'danger');
  }

  //need different API
  geocodePlaceId() {
    const latlng = {
      lat: parseFloat(this.pos.lat[0]),
      lng: parseFloat(this.pos.lng[1]),
    };
    this.geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          // this.map.setZoom(11);
          // const marker = new google.maps.Marker({
          //   position: latlng,
          //   map: this.map,
          // });
          console.log(results[0].formatted_address);
        } else {
          console.log('No results found');
        }
      } else {
        console.log('Geocoder failed due to: ' + status);
      }
    });
  }


  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 1000,
    });
    toast.present();
  }
}
