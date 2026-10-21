// ===== .xlsx yozish (zipStore) va o'qish (DecompressionStream) — tashqi kutubxonasiz =====
const CRCT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRCT[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function zipStore(files){
  const te=new TextEncoder(),parts=[],cen=[];let off=0;
  for(const f of files){
    const nm=te.encode(f.name),d=f.data,crc=crc32(d);
    const lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);lh.setUint16(10,0,true);lh.setUint16(12,33,true);
    lh.setUint32(14,crc,true);lh.setUint32(18,d.length,true);lh.setUint32(22,d.length,true);lh.setUint16(26,nm.length,true);lh.setUint16(28,0,true);
    parts.push(new Uint8Array(lh.buffer),nm,d);
    const ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);ch.setUint16(12,0,true);ch.setUint16(14,33,true);
    ch.setUint32(16,crc,true);ch.setUint32(20,d.length,true);ch.setUint32(24,d.length,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
    cen.push(new Uint8Array(ch.buffer),nm);
    off+=30+nm.length+d.length;
  }
  const cdSize=cen.reduce((a,b)=>a+b.length,0);
  const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cdSize,true);e.setUint32(16,off,true);
  const all=[...parts,...cen,new Uint8Array(e.buffer)];const out=new Uint8Array(off+cdSize+22);let p=0;for(const a of all){out.set(a,p);p+=a.length}return out;
}
const xesc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function colName(i){let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s}
function buildXlsx(sheets){
  const te=new TextEncoder(),U=s=>te.encode(s);const H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  const NS='xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
  const files=[];
  files.push({name:'[Content_Types].xml',data:U(H+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+sheets.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')+'</Types>')});
  files.push({name:'_rels/.rels',data:U(H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')});
  files.push({name:'xl/workbook.xml',data:U(H+`<workbook ${NS} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>`+sheets.map((s,i)=>`<sheet name="${xesc(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')+'</sheets></workbook>')});
  files.push({name:'xl/_rels/workbook.xml.rels',data:U(H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+sheets.map((s,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')+`<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`)});
  files.push({name:'xl/styles.xml',data:U(H+`<styleSheet ${NS}><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`)});
  sheets.forEach((s,i)=>{
    const nc=Math.max(...s.rows.map(r=>r.length));
    let x=H+`<worksheet ${NS}><cols><col min="1" max="${nc}" width="18" customWidth="1"/></cols><sheetData>`;
    s.rows.forEach((r,ri)=>{x+=`<row r="${ri+1}">`;r.forEach((v,ci)=>{
      const ref=colName(ci)+(ri+1),st=ri===0?' s="1"':'';
      if(typeof v==='number'&&isFinite(v))x+=`<c r="${ref}"${st}><v>${v}</v></c>`;
      else if(v!==''&&v!=null)x+=`<c r="${ref}"${st} t="inlineStr"><is><t>${xesc(v)}</t></is></c>`;
    });x+='</row>'});
    x+='</sheetData></worksheet>';files.push({name:`xl/worksheets/sheet${i+1}.xml`,data:U(x)});
  });
  return zipStore(files);
}
async function inflateRaw(u8){
  if(typeof DecompressionStream==='undefined')throw new Error('Brauzeringiz .xlsx o‘qishni qo‘llamaydi. Faylni CSV qilib saqlab yuklang.');
  const ds=new DecompressionStream('deflate-raw');const w=ds.writable.getWriter();w.write(u8);w.close();
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}
async function unzip(buf){
  const u=new Uint8Array(buf),dv=new DataView(buf);let e=-1;
  for(let i=u.length-22;i>=Math.max(0,u.length-65600);i--){if(dv.getUint32(i,true)===0x06054b50){e=i;break}}
  if(e<0)throw new Error('Bu .xlsx fayl emas (yoki buzilgan).');
  const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const td=new TextDecoder(),out={};
  for(let i=0;i<n;i++){
    if(dv.getUint32(p,true)!==0x02014b50)break;
    const meth=dv.getUint16(p+10,true),cs=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true);
    const name=td.decode(u.subarray(p+46,p+46+nl));p+=46+nl+xl+cl;
    if(!/^xl\/(worksheets\/sheet\d+\.xml|sharedStrings\.xml|workbook\.xml)$/.test(name))continue;
    const ln=dv.getUint16(lo+26,true),lx=dv.getUint16(lo+28,true),st=lo+30+ln+lx,raw=u.subarray(st,st+cs);
    out[name]=td.decode(meth===0?raw:await inflateRaw(raw));
  }
  return out;
}
async function readXlsx(buf){
  const z=await unzip(buf);const dp=new DOMParser();
  const sn=Object.keys(z).filter(k=>/worksheets\/sheet\d+\.xml/.test(k)).sort((a,b)=>parseInt(a.match(/\d+/g).pop())-parseInt(b.match(/\d+/g).pop()));
  if(!sn.length)throw new Error('Excel fayldan varaq topilmadi.');
  const ss=[];if(z['xl/sharedStrings.xml']){const d=dp.parseFromString(z['xl/sharedStrings.xml'],'application/xml');for(const si of d.getElementsByTagName('si'))ss.push([...si.getElementsByTagName('t')].map(t=>t.textContent).join(''))}
  const d=dp.parseFromString(z[sn[0]],'application/xml');const rows=[];
  for(const r of d.getElementsByTagName('row')){
    const row=[];
    for(const c of r.getElementsByTagName('c')){
      const ref=c.getAttribute('r')||'';const m=ref.match(/^([A-Z]+)/);let ci=0;if(m)for(const ch of m[1])ci=ci*26+ch.charCodeAt(0)-64;ci--;
      const t=c.getAttribute('t'),ve=c.getElementsByTagName('v')[0];let val='';
      if(t==='s'&&ve)val=ss[+ve.textContent]||'';else if(t==='inlineStr')val=[...c.getElementsByTagName('t')].map(x=>x.textContent).join('');else if(ve)val=ve.textContent;
      row[ci<0?row.length:ci]=String(val);
    }
    for(let i=0;i<row.length;i++)if(row[i]===undefined)row[i]='';
    if(row.some(x=>x!==''))rows.push(row);
  }
  return rows;
}
function download(name,u8,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([u8],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
