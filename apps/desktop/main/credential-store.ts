import {safeStorage} from 'electron'
import {mkdir,readFile,rm,writeFile} from 'node:fs/promises'
import {dirname,join} from 'node:path'

export interface CredentialStore{available():Promise<boolean>;load():Promise<string|null>;save(value:string):Promise<void>;remove():Promise<void>}
export class SecureCredentialStore implements CredentialStore{
 private path:string
 constructor(dataPath:string){this.path=join(dataPath,'credentials','openai-api-key.bin')}
 async available(){return safeStorage.isAsyncEncryptionAvailable()}
 async load(){if(!await this.available())return null;try{const encrypted=await readFile(this.path),value=await safeStorage.decryptStringAsync(encrypted);if(value.shouldReEncrypt)await this.save(value.result);return value.result}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return null;throw Error('The saved OpenAI key could not be decrypted. Remove and replace it.') }}
 async save(value:string){if(!await this.available())throw Error('Secure OS credential storage is unavailable. The key was not saved. Choose session-only instead.');const encrypted=await safeStorage.encryptStringAsync(value);await mkdir(dirname(this.path),{recursive:true});await writeFile(this.path,encrypted,{mode:0o600})}
 async remove(){await rm(this.path,{force:true})}
}
