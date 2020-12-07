import { Place } from "./place";

export type Friend = {
  uid: string;
  name: string;
  avatar?: string;
};

export type FriendLocation = {
  uid: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
};
