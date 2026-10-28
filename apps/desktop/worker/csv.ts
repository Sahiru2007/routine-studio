import {parentPort,workerData} from 'node:worker_threads'
import {z} from 'zod'
import {parseCsv} from '../../../packages/batch-schema/parse'
try{const input=z.object({bytes:z.instanceof(Uint8Array),title:z.string().max(160)}).strict().parse(workerData);parentPort!.postMessage({ok:true,value:parseCsv(input.bytes,input.title)})}catch(e){parentPort!.postMessage({ok:false,error:(e as Error).message.slice(0,500)})}
