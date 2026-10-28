export * from './document'
import type {Workflow,InspectionResult,Locator} from './document'
import type {RecordingState} from '../recorder-schema'
export type Bridge={
 list:()=>Promise<Workflow[]>;save:(w:Workflow)=>Promise<Workflow>;remove:(id:string)=>Promise<void>;
 status:()=>Promise<{dataPath:string;databasePath:string}>;dirty:(value:boolean)=>void;
 recordingStatus:()=>Promise<RecordingState>;recordingStart:(value:{url:string})=>Promise<RecordingState>;
 recordingStop:()=>Promise<RecordingState>;recordingCancel:()=>Promise<RecordingState>;
 recordingSave:(value:{sessionId:string;workflow:Workflow})=>Promise<Workflow>;
 demoStart:()=>Promise<{url:string}>;demoReset:()=>Promise<void>;
 inspectionOpen:()=>Promise<void>;inspectionCheck:(value:{locator:Locator;requiredUrl:string})=>Promise<InspectionResult>;
}
