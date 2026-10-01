from pathlib import Path
import re
import hashlib
PROJECT=Path(__file__).resolve().parent
ROOT=(PROJECT/'dist').resolve()
ENTRY=(ROOT/'app.js').resolve()
import_re=re.compile(r"^import\s*\{([^}]*)\}\s*from\s*['\"]([^'\"]+)['\"];?\s*$",re.M)
side_re=re.compile(r"^import\s*['\"]([^'\"]+)['\"];?\s*$",re.M)
export_decl_re=re.compile(r"\bexport\s+(?=(?:async\s+)?(?:function|class|const|let|var)\s+)")
export_name_re=re.compile(r"\bexport\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)")

def key(path:Path)->str:return path.relative_to(ROOT).as_posix()
def resolve(path:Path,spec:str)->Path:
    p=(path.parent/spec).resolve()
    if not str(p).startswith(str(ROOT)): raise RuntimeError(spec)
    return p

def parse(path:Path):
    code=path.read_text()
    imports=[]
    for m in import_re.finditer(code):
        names=[]
        for raw in m.group(1).split(','):
            raw=raw.strip()
            if not raw: continue
            if ' as ' in raw:
                src,dst=[x.strip() for x in raw.split(' as ',1)]
            else: src=dst=raw
            names.append((src,dst))
        imports.append((resolve(path,m.group(2)),names))
    for m in side_re.finditer(code):imports.append((resolve(path,m.group(1)),[]))
    exports=export_name_re.findall(code)
    return code,imports,exports

seen=set();order=[]
def visit(path:Path):
    if path in seen:return
    seen.add(path);_,imports,_=parse(path)
    for dep,_ in imports:visit(dep)
    order.append(path)
visit(ENTRY)

chunks=["const __modules = Object.create(null);"]
for path in order:
    code,imports,exports=parse(path)
    code=import_re.sub('',code);code=side_re.sub('',code);code=export_decl_re.sub('',code)
    pre=[]
    for dep,names in imports:
        if names:
            bits=[src if src==dst else f"{src}: {dst}" for src,dst in names]
            pre.append("const {"+", ".join(bits)+"} = __modules["+repr(key(dep))+ "];")
    ret="return {"+", ".join(exports)+"};" if exports else "return {};"
    chunks.append(f"__modules[{key(path)!r}] = (() => {{\n"+'\n'.join(pre)+"\n"+code+"\n"+ret+"\n})();")
js='\n'.join(chunks)
css=(ROOT/'styles.css').read_text()
out=f'''<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#0b0d10"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><title>1903</title><style>{css}</style></head><body><div id="app"></div><script>{js}</script></body></html>'''
(PROJECT/'1903-playable-0.3.3.html').write_text(out)
(PROJECT/'index.html').write_text(out)
(PROJECT/'standalone-bundle.js').write_text(js)
worker=PROJECT/'sw.js'
worker.write_text(re.sub(r"const CACHE='[^']+';", "const CACHE='1903-standalone-0.3.3-"+hashlib.sha256(out.encode()).hexdigest()[:12]+"';",worker.read_text(),count=1))
print('modules',len(order),'html_bytes',len(out.encode()),'js_bytes',len(js.encode()))
