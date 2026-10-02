from pathlib import Path
import re
p=Path(__file__).resolve().parent
engine=re.sub(r"^export ","",(p/'engine.mjs').read_text(),flags=re.M)
app=re.sub(r"^import .*?;\n","",(p/'app.mjs').read_text(),count=1)
css=(p/'styles.css').read_text()
script=(engine+"\n"+app).replace("</script>","<\\/script>")
html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f5f6f7"><title>1903 · Dez clubes</title><style>'+css+'</style></head><body><div id="app"></div><script type="module">'+script+'</script></body></html>'
(p/'index.html').write_text(html)
print(f"Standalone: {len(html.encode())} bytes")
