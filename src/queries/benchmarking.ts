import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
// import {
//   BenchmarkingAllStoreDataResponse,
//   BenchmarkingFetchStoreDataResponse,
// } from '@/types/benchmarking'

// export async function fetchAllStoreData(token: string) {
//   const { data } = await pythia2Client.get<BenchmarkingAllStoreDataResponse>(
//     PYTHIA_2_API.benchmarking.allStoreData,
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   )
//   return data.data
// }

// export async function fetchStoreData(token: string, storeId: string) {
//   const { data } = await pythia2Client.get<BenchmarkingFetchStoreDataResponse>(
//     PYTHIA_2_API.benchmarking.fetchStoreData(storeId),
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   )
//   return data.data[0] || null
// }
