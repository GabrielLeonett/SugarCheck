# Fuente para exportación PDF en japonés

`NotoSansJP-Regular.woff` se genera a partir de `NotoSansJP-Regular.ttf`
(variable, eje `wght`) y es la que se empaqueta en `dist`.

El `.ttf` original pesa ~9,6 MB porque incluye las tablas de variación
(`fvar`, `gvar`, `HVAR`, `avar`, `STAT`). La app solo usa la instancia por
defecto, así que esas tablas no aportan nada al PDF. El `.woff` mantiene
**todos los glifos y métricas** (mismo `cmap` y mismo `hmtx`), pero pesa
~3 MB y PDFKit/fontkit lo leen sin problemas.

Regeneración (requiere `pip install fonttools brotli`):

```bash
python - <<'PY'
from fontTools.ttLib import TTFont

src = "NotoSansJP-Regular.ttf"
out = "NotoSansJP-Regular.woff"

font = TTFont(src)
for tag in ["fvar", "gvar", "HVAR", "avar", "STAT"]:
    if tag in font:
        del font[tag]

font.flavor = "woff"
font.save(out)
PY
```

> Nota: no usar WOFF2 aquí. fontkit lo puede leer, pero su subset no
> funciona con WOFF2 y PDFKit termina incrustando el font completo
> (el PDF resultante pesa ~17 MB).
