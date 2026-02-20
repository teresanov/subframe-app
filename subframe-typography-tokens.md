# Tipografía – Tokens para Subframe

**Fuente:** `src/ui/tailwind.config.js`  
**Uso:** Theme → Typography → editar cada token manualmente (Subframe no importa tipografía vía archivo).

---

## Familia de fuente

| Token    | Familia   |
|----------|-----------|
| caption  | Geist     |
| caption-bold | Geist |
| body     | Geist     |
| body-bold| Geist     |
| heading-3| Geist     |
| heading-2| Geist     |
| heading-1| Geist     |
| monospace-body | monospace |

---

## Tokens de tipografía

| Token        | Font size | Line height | Font weight | Letter spacing |
|--------------|-----------|-------------|-------------|----------------|
| **caption**  | 12px      | 16px        | 400         | 0em            |
| **caption-bold** | 12px  | 16px        | 500         | 0em            |
| **body**     | 14px      | 20px        | 400         | 0em            |
| **body-bold**| 14px      | 20px        | 500         | 0em            |
| **heading-3**| 16px      | 20px        | 500         | 0em            |
| **heading-2**| 20px      | 24px        | 500         | 0em            |
| **heading-1**| 30px      | 36px        | 500         | 0em            |
| **monospace-body** | 14px | 20px        | 400         | 0em            |

---

## Detalle por token

### Caption
- **Font size:** 12px  
- **Line height:** 16px  
- **Font weight:** 400 (Regular)  
- **Letter spacing:** 0em  
- **Font family:** Geist  

### Caption Bold
- **Font size:** 12px  
- **Line height:** 16px  
- **Font weight:** 500 (Medium)  
- **Letter spacing:** 0em  
- **Font family:** Geist  

### Body
- **Font size:** 14px  
- **Line height:** 20px  
- **Font weight:** 400 (Regular)  
- **Letter spacing:** 0em  
- **Font family:** Geist  

### Body Bold
- **Font size:** 14px  
- **Line height:** 20px  
- **Font weight:** 500 (Medium)  
- **Letter spacing:** 0em  
- **Font family:** Geist  

### Heading 3
- **Font size:** 16px  
- **Line height:** 20px  
- **Font weight:** 500 (Medium)  
- **Letter spacing:** 0em  
- **Font family:** Geist  

### Heading 2
- **Font size:** 20px  
- **Line height:** 24px  
- **Font weight:** 500 (Medium)  
- **Letter spacing:** 0em  
- **Font family:** Geist  

### Heading 1
- **Font size:** 30px  
- **Line height:** 36px  
- **Font weight:** 500 (Medium)  
- **Letter spacing:** 0em  
- **Font family:** Geist  

### Monospace Body
- **Font size:** 14px  
- **Line height:** 20px  
- **Font weight:** 400 (Regular)  
- **Letter spacing:** 0em  
- **Font family:** monospace  

---

## Cómo aplicarlo en Subframe

1. Theme → **Typography**
2. Haz clic en el token que quieras editar
3. Ajusta font size, line height, font weight y letter spacing según la tabla
4. En **Font family**, asegúrate de que Geist esté disponible (Google Fonts o fuente personalizada)

Si Geist no aparece en Subframe, revisa en el proyecto que la fuente esté cargada (por ejemplo en `index.css` o HTML).
