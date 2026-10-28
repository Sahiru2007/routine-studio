import {contextBridge,ipcRenderer} from 'electron'
import type { Bridge } from '../../../packages/workflow-schema'
async function call(name:string,value?:unknown){const result=await ipcRenderer.invoke('studio:'+name,value);if(!result.ok)throw Error(result.error);return result.value}
const bridge:Bridge={list:()=>call('list'),save:w=>call('save',w),remove:id=>call('remove',id),status:()=>call('status'),dirty:value=>ipcRenderer.send('studio:dirty',value)}
contextBridge.exposeInMainWorld('studio',bridge)

