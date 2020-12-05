import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { UsersPageRoutingModule } from "./users-routing.module";

import { UsersPage } from "./users.page";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    UsersPageRoutingModule,
  ],
  declarations: [UsersPage],
})
export class UsersPageModule {}
