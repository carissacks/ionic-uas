import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { PlacesService } from "../services/places.service";
import { User } from "../models/user";
import { Place } from "../models/place";
import { map } from "rxjs/operators";

@Component({
  selector: "app-tab3",
  templateUrl: "tab3.page.html",
  styleUrls: ["tab3.page.scss"],
})
export class Tab3Page implements OnInit {
  user: User;
  places: Array<Place>;
  constructor(private authSrv: AuthService, private placesSrv: PlacesService) {}

  ngOnInit() {
    this.user = this.authSrv.getCurrentUserDetail();
    this.placesSrv
      .getAll(this.user.uid)
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
  }

  logout(){
    this.authSrv.signOut();
  }
}
