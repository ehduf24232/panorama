export interface Panorama {
  url: string;
  tag: string;
}

export interface Room {
  _id: string;
  buildingId: string;
  name: string;
  number: string;
  size: string;
  price: number;
  floor: number;
  description: string;
  imageUrl: string;
  panoramas: Panorama[];
} 