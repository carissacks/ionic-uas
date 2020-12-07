import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { PlacesService } from '../services/places.service';
import { User } from '../models/user';
import { Place } from '../models/place';
import { finalize, map } from 'rxjs/operators';
import {
  ActionSheetController,
  AlertController,
  GestureController, LoadingController,
  Platform, ToastController,
} from '@ionic/angular';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Capacitor,
} from '@capacitor/core';
import { UsersService } from '../services/users.service';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  currUid: string;
  user: User;
  places: Array<Place>;
  isDesktop;

  @ViewChild('fileInput', { static: false }) fileInputRef: ElementRef<
    HTMLInputElement
  >;

  constructor(
    private authSrv: AuthService,
    private usersSrv: UsersService,
    private placesSrv: PlacesService,
    private storage: AngularFireStorage,
    private platform: Platform,
    private gestureCtrl: GestureController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  ngOnInit() {
    this.currUid = this.authSrv.getUid();
    this.usersSrv.getDetail(this.currUid).valueChanges().subscribe((data) => {this.user = data; });
    this.placesSrv
      .getAll(this.currUid)
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((item) => ({
            key: item.payload.key,
            ...item.payload.val(),
          }))
        )
      )
      .subscribe((data) => {
        this.places = data.reverse();
      });
    if (
      (this.platform.is('mobile') && this.platform.is('hybrid')) ||
      this.platform.is('desktop')
    ) {
      this.isDesktop = true;
    }
  }

  async showAlert(key: string) {
    const alert = await this.alertCtrl.create({
      header: 'Cover your track',
      message:
        'Are you sure you want to remove this location from your history?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'danger',
        },
        {
          text: 'Remove',
          handler: async () => {
            const res = await this.placesSrv.delete(this.currUid, key);
            if (res.success){
              this.presentToast('Check point deleted', 'success');
              return;
            }
            this.presentToast('Oops. Try again', 'danger');
            console.log(res.error);
          },
        },
      ],
    });

    await alert.present();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 1000,
    });
    toast.present();
  }

  async startUploading() {
    const loading = await this.loadingCtrl.create({
      message: 'Updating your new look',
    });
    await loading.present();
  }

  async finishUploading(){
    await this.loadingCtrl.dismiss();
  }

  logout() {
    this.authSrv.signOut();
  }

  async displayPicSourceOption() {
    const actionSheet = await this.actionSheetCtrl.create({
      animated: true,
      mode: 'ios',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.getPicture('camera');
          },
        },
        {
          text: 'Gallery',
          icon: 'image-outline',
          handler: () => {
            this.getPicture('gallery');
          },
        },
      ],
    });
    await actionSheet.present();
  }

  async getPicture(type: string) {
    if (
      !Capacitor.isPluginAvailable('Camera') ||
      (this.isDesktop && type === 'gallery')
    ) {
      this.fileInputRef.nativeElement.click();
      return;
    }

    const image = await Camera.getPhoto({
      quality: 100,
      width: 400,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
    });
    this.uploadImage(image.base64String, true);
  }

  onFileChosen(event) {
    const file = event.target.files[0];
    const pattern = /image-*/;

    if (!file.type.match(pattern)) {
       this.presentToast('File format not supported', 'danger');
       return;
    }

    this.uploadImage(file, false);
  }

  async uploadImage(image: string, isCamera: boolean) {
    await this.startUploading();
    const filePath = `ProfilePic/${new Date().toISOString()}`;
    const fileRef = this.storage.ref(filePath);
    let task;
    if (isCamera) {
      task = fileRef.putString(image, 'base64', {
        contentType: 'image/png',
      });
    } else {
      task = this.storage.upload(filePath, image);
    }
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            if (url) {
              this.usersSrv.createOrUpdate(this.currUid, {
                ...this.user,
                avatar: url,
              });
              this.finishUploading();
              this.presentToast('Profile picture is updated', 'success');
            }
          });
        })
      )
      .subscribe();
  }
}
