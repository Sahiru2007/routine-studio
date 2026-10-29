export function freshCompletedEvidence(result,{invocationId,startedAt,childCode,timedOut}){
 return childCode===0&&!timedOut&&!!result&&result.runId!==invocationId&&Number.isFinite(Date.parse(result.startedAt))&&Date.parse(result.startedAt)>=Date.parse(startedAt)&&result.status==='completed'&&typeof result.finishedAt==='string'&&Number.isFinite(Date.parse(result.finishedAt))&&Array.isArray(result.checks)&&result.checks.length===4&&Array.isArray(result.rendererErrors)&&result.rendererErrors.length===0
}
export function assistanceCompletionExitCode(result,context){return freshCompletedEvidence(result,context)?0:1}
