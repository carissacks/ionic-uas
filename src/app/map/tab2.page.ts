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
import { ToastController } from '@ionic/angular';
import { Friend, FriendLocation } from '../models/friend';
import { map } from 'rxjs/operators';

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
  friendsLocation: Array<FriendLocation> = [];
  friends: Array<Friend>;
  map: any;
  marker: any;
  friendsMarker: Map<string, any> = new Map();
  hasCheckedIn = false;

  pos: { lat: number; lng: number } = {
    // UMN
    lat: -6.256081,
    lng: 106.618755,
  };

  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private authSrv: AuthService,
    private friendsSrv: FriendsService,
    private placesSrv: PlacesService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.currUid = this.currUid = this.authSrv.getUid();
    this.form = this.formBuilder.group({
      name: new FormControl('', Validators.required),
    });
    this.getAllFriendsLocation();
    setTimeout(() => {
      if (this.hasCheckedIn) { return; }
      this.recenter();
      this.checkIn(true);
    }, 600000);
  }

  getAllFriendsLocation() {
    this.friendsSrv
      .getAll(this.currUid)
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((item) => ({
            uid: item.payload.key,
            ...item.payload.val(),
          }))
        )
      )
      .subscribe((friends) => {
        this.friends = friends;
        this.friendsLocation = [];
        friends.map(({ uid, name }, idx) =>
          this.placesSrv
            .getLatest(uid)
            .snapshotChanges()
            .pipe(
              map((changes) =>
                changes.map((item) => ({
                  ...item.payload.val(),
                }))
              )
            )
            .subscribe((locations) => {
              const location = locations[0];
              this.friendsLocation[idx] = { uid, name, location };
              this.handleFriendsMarker(this.friendsLocation[idx]);
            })
        );
      });
  }

  handleFriendsMarker(data) {
    const { uid, location } = data;
    const dist = this.checkDistanceInKm(this.pos, location);
    if (dist <= 20) {
      if (this.friendsMarker.has(uid)) {
        this.updateFriendsMarker(data);
        return;
      }
      this.addFriendsMarker(data);
      return;
    }
    if (this.friendsMarker.has(uid)) {
      this.deleteFriendMarker(uid);
      return;
    }
  }

  refreshNearbyFriends() {
    this.friendsMarker.forEach((marker) => marker.setMap(null));
    this.friendsMarker.clear();
    this.friendsLocation.map((friend) => this.handleFriendsMarker(friend));
  }

  addFriendsMarker({ uid, name, location }) {
    this.friendsMarker.set(
      uid,
      new google.maps.Marker({
        position: location,
        map: this.map,
        label: name,
      })
    );
  }

  updateFriendsMarker({ uid, name, location }) {
    const marker = this.friendsMarker.get(uid);
    marker.setPosition(location);
  }

  deleteFriendMarker(uid) {
    const marker = this.friendsMarker.get(uid);
    marker.setMap(null);
    this.friendsMarker.delete(uid);
  }

  ionViewDidEnter() {
    this.initMap(this.pos);
    this.refreshNearbyFriends();
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
    // this.geocoder = new google.maps.Geocoder();

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
        this.refreshNearbyFriends();
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
        this.marker.setPosition(this.pos);
      });
    }
  }

  async checkIn(isAuto = false) {
    let name;
    if (!isAuto) {
      if (this.form.invalid) {
        return;
      }
      name = this.form.value.name;
    } else {
      name = 'Automatic check in';
    }
    const res = await this.placesSrv.checkIn(this.currUid, {
      ...this.pos,
      name,
    });

    if (res.success) {
      this.hasCheckedIn = true;
      this.presentToast(`You've been pinned!`, 'success');
      this.manualCheckIn = false;
      this.form.reset();
      return;
    }
    this.presentToast(`We can't track you. Please try again.`, 'danger');
  }

  // need different API
  // geocodePlaceId() {
  //   const latlng = {
  //     lat: parseFloat(this.pos.lat[0]),
  //     lng: parseFloat(this.pos.lng[1]),
  //   };
  //   this.geocoder.geocode({ location: latlng }, (results, status) => {
  //     if (status === 'OK') {
  //       if (results[0]) {
  //         console.log(results[0].formatted_address);
  //       } else {
  //         console.log('No results found');
  //       }
  //     } else {
  //       console.log('Geocoder failed due to: ' + status);
  //     }
  //   });
  // }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 1000,
    });
    toast.present();
  }

  checkDistanceInKm({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 }) {
    const earthRadius = 6371; // Radius of the earth in km
    const latDegree = this.coordinatToDegree(lat2 - lat1);
    const lngDegree = this.coordinatToDegree(lng2 - lng1);
    const a =
      Math.sin(latDegree / 2) * Math.sin(latDegree / 2) +
      Math.cos(this.coordinatToDegree(lat1)) *
        Math.cos(this.coordinatToDegree(lat2)) *
        Math.sin(lngDegree / 2) *
        Math.sin(lngDegree / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c; // Distance in km
  }

  coordinatToDegree(coordinate) {
    return coordinate * (Math.PI / 180);
  }
}
