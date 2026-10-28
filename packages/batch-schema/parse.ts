import {parse} from 'csv-parse/sync'
import {Dataset,LIMITS,type Data} from './index'
export function parseCsv(bytes:Uint8Array,title:string):Data{
 if(!bytes.length)throw Error('CSV is empty. Include a header and at least one data row.')
 if(bytes.length>LIMITS.bytes)throw Error('CSV exceeds the 2 MiB file limit.')
 let text:string;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes)}catch{throw Error('CSV must use valid UTF-8 encoding (BOM is supported).')}
 if(text.includes('\0'))throw Error('NUL bytes are unsupported; save the file as UTF-8, not UTF-16.')
 let records:{record:string[];info:{lines:number}}[]
 try{records=zRecords(parse(text,{bom:true,cast:false,info:true,skip_empty_lines:false,max_record_size:LIMITS.record,relax_column_count:false}))}catch(e){const error=e as {code?:string;lines?:number};throw Error('Malformed CSV near physical line '+(error.lines??'?')+': '+({CSV_RECORD_INCONSISTENT_FIELDS_LENGTH:'inconsistent column count',CSV_QUOTE_NOT_CLOSED:'unclosed quoted field',CSV_INVALID_CLOSING_QUOTE:'invalid closing quote',CSV_MAX_RECORD_SIZE:'record exceeds 100000 characters'}[error.code??'']??'invalid quoting or record structure')+'.')}
 if(records.length<2)throw Error('CSV needs a header and at least one data row.')
 if(records.length-1>LIMITS.rows)throw Error('CSV exceeds 1000 data rows.')
 const columns=records[0].record
 if(columns.length>LIMITS.columns)throw Error('CSV exceeds 50 columns.')
 if(columns.some(s=>!s.trim()||s.length>160)||new Set(columns.map(s=>s.trim())).size!==columns.length)throw Error('CSV headers must be nonblank, unique after trimming, and at most 160 characters.')
 let end=records[0].info.lines
 const rows=records.slice(1).map((r,i)=>{if(r.record.some(s=>s.length>LIMITS.field))throw Error('Source record '+(i+2)+' exceeds the 10000-character field limit.');const line=end+1;end=r.info.lines;return {id:crypto.randomUUID(),number:i+2,line,endLine:end,cells:r.record}})
 return Dataset.parse({formatVersion:1,id:crypto.randomUUID(),title:title.slice(0,160)||'Imported CSV',revision:0,updatedAt:new Date().toISOString(),columns,rows})
}
import {z} from 'zod'
function zRecords(value:unknown){return z.array(z.object({record:z.array(z.string()),info:z.object({lines:z.number().int().positive()})})).parse(value)}
