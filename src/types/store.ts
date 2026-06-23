// Raw shape returned by the Pythia-1 /stores/all/mine endpoint
export interface Store {
  _id: string
  name: string
  storeNo: string
  location: string
  district: string
  createdBy: string
  updatedBy: string | null
  createdAt: string
  updatedAt: string
  __v: number
}
