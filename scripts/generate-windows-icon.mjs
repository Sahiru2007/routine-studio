import {chromium} from 'playwright'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'

const root=resolve(import.meta.dirname,'..')
const source=resolve(root,'build','icon.svg')
const pngPath=resolve(root,'build','icon.png')
const icoPath=resolve(root,'build','icon.ico')
const sizes=[16,20,24,32,40,48,64,128,256]
for(const path of [source,pngPath,icoPath]){
 if(!/^E:[\\/]/i.test(path))throw Error('Routine Studio icon generation must stay on E:')
}
mkdirSync(dirname(pngPath),{recursive:true})
const svg=readFileSync(source,'utf8')
const browser=await chromium.launch({headless:true})
const images=[]
try{
 for(const size of sizes){
  const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1})
  await page.setContent(`<style>html,body{margin:0;width:${size}px;height:${size}px;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`)
  images.push({size,data:await page.screenshot({omitBackground:true})})
  await page.close()
 }
}finally{
 await browser.close()
}
const header=Buffer.alloc(6+16*images.length)
header.writeUInt16LE(0,0)
header.writeUInt16LE(1,2)
header.writeUInt16LE(images.length,4)
let offset=header.length
images.forEach(({size,data},index)=>{
 const entry=6+index*16
 header.writeUInt8(size===256?0:size,entry)
 header.writeUInt8(size===256?0:size,entry+1)
 header.writeUInt8(0,entry+2)
 header.writeUInt8(0,entry+3)
 header.writeUInt16LE(1,entry+4)
 header.writeUInt16LE(32,entry+6)
 header.writeUInt32LE(data.length,entry+8)
 header.writeUInt32LE(offset,entry+12)
 offset+=data.length
})
writeFileSync(icoPath,Buffer.concat([header,...images.map(image=>image.data)]))
writeFileSync(pngPath,images.at(-1).data)
console.log(`Generated ${icoPath} with ${sizes.join(', ')}px PNG frames and ${pngPath}.`)
