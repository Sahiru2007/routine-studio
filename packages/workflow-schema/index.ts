export * from './document'
import type {Workflow,InspectionResult,Locator} from './document'
import type {RecordingState} from '../recorder-schema'
import type {Run,Summary} from '../execution-schema'
import type {Data,MapDocument,Preview,BatchRecord,BatchSummary} from '../batch-schema'
export type Bridge={
 runNotes:(value:{id:string})=>Promise<{at:string;text:string;acknowledged:boolean}[]>;runNote:(value:{id:string;text:string;acknowledged:boolean})=>Promise<{at:string;text:string;acknowledged:boolean}[]>;
 batchPrepare:(value:unknown)=>Promise<BatchRecord>;batchStart:(value:{id:string;approved:true})=>Promise<BatchRecord>;batchStatus:(value:{id:string})=>Promise<{batch:BatchRecord;runs:Run[]}>;batchList:()=>Promise<BatchSummary[]>;batchPause:(value:{id:string})=>Promise<BatchRecord>;batchResume:(value:{id:string})=>Promise<BatchRecord>;batchStop:(value:{id:string})=>Promise<BatchRecord>;batchApprove:(value:{id:string;requestId:string;allow:boolean})=>Promise<BatchRecord>;batchNote:(value:{id:string;text:string;acknowledged:boolean})=>Promise<BatchRecord>;batchRemaining:(value:{id:string;acknowledged:true})=>Promise<BatchRecord>;resultExport:(value:{kind:'batch'|'run';id:string;format:'json'|'csv'})=>Promise<{saved:boolean;path?:string}>;
 dataImport:()=>Promise<Data|null>;dataList:()=>Promise<Data[]>;dataSave:(value:Data)=>Promise<Data>;dataDelete:(value:{id:string})=>Promise<void>;
 mappingList:()=>Promise<MapDocument[]>;mappingSave:(value:MapDocument)=>Promise<MapDocument>;mappingDelete:(value:{id:string})=>Promise<void>;mappingPreview:(value:MapDocument)=>Promise<Preview>;
 list:()=>Promise<Workflow[]>;save:(w:Workflow)=>Promise<Workflow>;remove:(id:string)=>Promise<void>;
 status:()=>Promise<{dataPath:string;databasePath:string}>;dirty:(value:boolean)=>void;
 recordingStatus:()=>Promise<RecordingState>;recordingStart:(value:{url:string})=>Promise<RecordingState>;
 recordingStop:()=>Promise<RecordingState>;recordingCancel:()=>Promise<RecordingState>;
 recordingSave:(value:{sessionId:string;workflow:Workflow})=>Promise<Workflow>;
 demoStart:()=>Promise<{url:string}>;demoReset:()=>Promise<void>;
 inspectionOpen:()=>Promise<void>;inspectionCheck:(value:{locator:Locator;requiredUrl:string})=>Promise<InspectionResult>;
 runPrepare:(value:{workflowId:string;revision:number;inputs:Record<string,string>})=>Promise<Run>;
 runStart:(value:{runId:string})=>Promise<Run>;runStatus:(value:{runId:string})=>Promise<Run>;
 runPause:(value:{runId:string})=>Promise<Run>;runResume:(value:{runId:string})=>Promise<Run>;
 runStop:(value:{runId:string})=>Promise<Run>;runApprove:(value:{runId:string;requestId:string;allow:boolean})=>Promise<Run>;
 runList:()=>Promise<Summary[]>;
}
