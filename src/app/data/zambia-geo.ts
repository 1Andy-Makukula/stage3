export const zambiaGeo = {
  Central: ['Kabwe', 'Kapiri Mposhi', 'Mkushi', 'Mumbwa', 'Serenje'],
  Copperbelt: ['Kitwe', 'Ndola', 'Mufulira', 'Chingola', 'Luanshya'],
  Eastern: ['Chipata', 'Katete', 'Petauke', 'Lundazi', 'Nyimba'],
  Luapula: ['Mansa', 'Samfya', 'Kawambwa', 'Nchelenge', 'Mwense'],
  Lusaka: ['Lusaka', 'Chilanga', 'Chongwe', 'Kafue', 'Rufunsa'],
  Muchinga: ['Chinsali', 'Mpika', 'Nakonde', 'Isoka', 'Shiwangandu'],
  Northern: ['Kasama', 'Mbala', 'Mpulungu', 'Mporokoso', 'Luwingu'],
  'North-Western': ['Solwezi', 'Kasempa', 'Mwinilunga', 'Zambezi', 'Kalumbila'],
  Southern: ['Livingstone', 'Choma', 'Mazabuka', 'Monze', 'Kalomo'],
  Western: ['Mongu', 'Senanga', 'Sesheke', 'Kaoma', 'Kalabo'],
} as const;

export type ZambiaProvince = keyof typeof zambiaGeo;
