# ROXWANA · Portada urbana · v0.11.0

```sh
npm ci
npm run dev
npm run build
```

La portada usa React, TypeScript, Vite y GSAP. En `src/heroAssets.ts` están las imágenes, las entradas y la profundidad de cada personaje. En `src/hero.css` se ajustan sus posiciones, tamaños y orden de capas en escritorio y móvil. Los carteles muestran un aviso de sección en preparación. Cuando existan las secciones, usar los identificadores de `NAV_ITEMS` para enlazarlas.

La ciudad y la playa al anochecer son dos fotografías generadas de forma independiente. Sus entradas se definen en `heroAssets.ts` y sus cortes en `hero.css`. El papel superior está detrás de la marca y el inferior entra por delante del conjunto. Los PNG originales están en `arte` y las copias WebP en `public/assets`. El humo forma parte de la entrada y se disipa. El movimiento de puntero requiere un mouse y se desactiva con la preferencia de movimiento reducido.

## Imágenes

El sello y el monograma se extraen de `logo1.png`. Los recortes fotográficos a cuerpo entero son propuestas editables derivadas de `Trío rebelde en la pared urbana.png`. Las partes ocultas o fuera de cuadro se reconstruyen y requieren revisión de arte, especialmente los estampados.

## Three.js

Three.js y sus tipos están instalados. Para una futura escena, crear un módulo independiente y cargarlo con `import()` desde el punto que active esa escena. Conservar una alternativa estática, limitar el ratio de píxeles, pausar al perder visibilidad y liberar el renderer, geometrías, materiales, texturas y listeners al desmontar. La portada se compone en HTML y CSS con GSAP.

## Prueba heavy metal

Abrir `/?escena=metal` en el servidor local para revisar el trío metal con sus poses de referencia. Los PNG de cuerpo entero están en `arte`; las copias WebP viven en `public/assets`. La variante metal combina un recital con una ruta de gira recortada en diagonal y una calavera de serigrafía. Las dos fotos y la calavera tienen su archivo y su entrada. La URL principal abre la portada urbana.

## Portada rap

Abrir `/?escena=rap` para ver el trío rap. Cada personaje tiene un PNG maestro transparente y una copia WebP. El callejón grafiteado y la van de puerta corrediza son fondos separados. Sus posiciones y recortes están en `hero.css`.

Los tres puntos del pie permiten cambiar entre Estilo urbano, Heavy metal y Rap. El punto relleno indica la portada activa. Las flechas de los extremos inferiores permiten avanzar y retroceder. Al ingresar, la portada avanza cada 20 segundos hasta volver de Rap a Estilo urbano. La vuelta ocurre una vez y se cancela al elegir manualmente con un punto o una flecha. Al recargar, se vuelve al inicio en Estilo urbano y se activa una vuelta nueva.

Las etiquetas de portada enlazan a Descripción (`#descripcion`), Estampas (`#probador`), Redes (`#redes`) y Contacto. Contacto abre el mismo WhatsApp que el botón flotante. Están disponibles en las tres variantes de Portada.

## Música de Portada

Estilo urbano, Heavy metal y Rap usan `public/assets/portada-urbana-v0.19.0.mp3`, `public/assets/portada-heavy-v0.19.0.mp3` y `public/assets/portada-rap-v0.19.0.mp3`, respectivamente. Son copias web de los WAV entregados. El parlante está arriba a la derecha. La música empieza en silencio. El parlante pulsa en rojo y muestra tres ondas una por una hasta que el visitante activa el sonido. El control de volumen contiguo arranca al 10 % y mantiene el nivel al cambiar de escena. Con el sonido activado, la pista correspondiente empieza al elegir el estilo y sigue sonando al recorrer la página. Los controles permanecen fijos arriba a la derecha. La música se pausa durante la lectura de Descripción y retoma desde el mismo punto al terminar o detenerla, en el volumen elegido. Al cambiar de estilo se reemplaza la pista anterior.

Las pistas se asignan por estilo en `sceneTracks` dentro de `src/main.tsx`.

## Profundidad 2.5D

En escritorio, cada capa sigue el movimiento del mouse con la intensidad de `depth` en `src/heroAssets.ts`. Un valor negativo mueve el fondo en la dirección opuesta. GSAP separa el parallax de las animaciones de entrada. El menú y los puntos de navegación conservan su posición. El parallax está activo de forma predeterminada con mouse en escritorio. La portada muestra el movimiento 2.5D por defecto. La URL `movimiento=0` permite pausarlo durante una revisión. El parallax no se activa con toque. Al entrar en cada escena, sus dos fondos y sus tres personajes se superponen en secuencia durante cerca de un segundo. Con movimiento reducido, la entrada usa desplazamientos más cortos.

## Descripción

La sección `#descripcion` aparece después de las tres variantes de Portada. Usa el recorte de la modelo pelirroja en cuclillas y explica la personalización de remeras, la sublimación y el DTF. La modelo sube y baja suavemente y se amplía al pasarle el mouse por encima. Su maquetación está en `src/Description.tsx` y `src/description.css`.


El botón **Escuchar** reproduce la descripción completa con el locutor rioplatense de ROXWANA. La versión con las pausas limpias está en `public/assets/descripcion-voz-v0.19.3.wav`. El mismo botón inicia o detiene la lectura.

## Movimiento en celular

- En una portada, tocar **Activar movimiento**, aceptar el permiso si aparece y mantener el celular quieto durante la calibración. **Recalibrar** toma una nueva posición de referencia y **Desactivar movimiento** vuelve al control táctil.
- Deslizar un dedo sobre los personajes permite probar el parallax táctil. Al soltar vuelven al centro. El gesto vertical conserva el scroll del navegador.
- Los fondos usan dos fotos más recortes de papel animados. Cada personaje tiene su capa. No hay un recorte separado de la mano, de modo que se mueve con el personaje. La salida con ScrollTrigger solo desplaza el fondo de Portada.
- Abrir desde el teléfono una vista de desarrollo por HTTPS para probar el sensor. Para probar solo los gestos en la misma red, iniciar Vite con `npm run dev -- --host 0.0.0.0` y abrir la dirección de red que muestra Vite. En una URL HTTP de red, el sensor puede estar bloqueado, pero funciona el gesto táctil.
- Ajustar `mobileDepth` y `delay` en `src/heroAssets.ts`, la sensibilidad en `src/deviceTilt.ts`, y los tamaños y áreas seguras en `src/hero.css` y `src/mobileHero.css`. La inclinación requiere autorización en navegadores que la solicitan. Con movimiento reducido, los gestos y el scroll quedan estáticos, y una activación explícita de inclinación usa un recorrido menor.


## Probador de estampas

Abrir `/#probador` para ver la modelo con la remera lisa y elegir los diseños. La sección mantiene el frente de la remera y la estampa en capas fijas. Los brazos y las mangas se superponen alrededor al hacer el gesto. Al elegir una estampa, el diseño anterior sigue visible hasta que el nuevo termina de cargar. El cambio es directo. El modelo baja primero la cabeza, luego levanta los brazos y toca los costados de la remera. Después vuelve a guardar las manos en los bolsillos y levanta la cabeza. Los gestos usan capas separadas del frente original de la remera. Volver a tocar la misma estampa reinicia el gesto. Con movimiento reducido, se omite el fundido entre posiciones. La zona de impresión se fija con porcentajes respecto de la imagen y conserva el tamaño relativo al adaptar la pantalla.

Estampas fuente: `E:/estampas-roxwana/Trabajos`. Para sumar una, ejecutar con Python y Pillow:

```sh
python scripts/importar_estampas.py --version 0.10.0 --estampa "Nombre del diseño" "E:/estampas-roxwana/Trabajos/carpeta/archivo.png"
```

El script verifica el alfa, recorta márgenes transparentes, conserva la proporción y guarda una copia de pantalla de hasta 640 px y una miniatura de hasta 160 px. Se pueden repetir los argumentos `--estampa` para importar varias de una vez. Vite detecta los archivos al compilar. Los archivos fuente `.ai` se exportan como PNG transparente antes de importarlos. Led Zeppelin y Pink Floyd se exportaron desde sus archivos de Illustrator. Para Jurassic Park se exportaron solo el título y el arte que estaban separados del mockup de la remera.

Para ver las guías en desarrollo, abrir `/?calibrar=neutra#probador`. Los valores `mirada` y `reaccion` muestran la cabeza baja con las manos en los bolsillos y la pose con los brazos levantados, respectivamente. Al elegir o volver a tocar una estampa se ve la reacción y, al terminar, se recupera la pose de calibración. `src/features/probador/artwork.ts` define las zonas. El selector usa `centro` y `pechoDerecho` queda preparada para una estampa chica en el pecho derecho de la modelo.


El probador aplica los ajustes guardados de cada estampa. El panel **Ajustar estampa** está oculto en esta versión. Para una nueva calibración, se puede habilitar en desarrollo desde `showStampAdjuster` en `src/features/probador/StampExperience.tsx`.

El selector **Mujer / Hombre / Niño** usa el estilo de papel de la portada. Al pasar entre Mujer y Hombre se conserva la estampa activa. La URL `/?modelo=hombre#probador` abre el modelo masculino. Los ajustes se guardan por modelo en `ajustes.json` y `ajustes-hombre.json`.


## Redes sociales · El muro social

Recorrido de la página: Portada (`#portada`), Descripción (`#descripcion`), Probador (`#probador`) y Redes sociales (`#redes`). El muro reúne Producción, ROXWANA en la calle y En movimiento. Los dos primeros afiches enlazan al mismo perfil de Instagram y el tercero a YouTube. La fila de íconos y el pie muestran Instagram y YouTube. TikTok sigue definido en `socialProfiles` y su ícono se conserva en `SocialLinks.tsx`. Para volver a mostrarlo en ambos lugares, agregarlo a `visibleSocialProfiles`.

Editar títulos, pies, textos alternativos, imágenes y destinos en `src/features/social/socialCards.ts`. Los tres WebP en `public/assets/social/` son recreaciones editoriales de los recortes de la página 2 del PDF. Los recortes del PDF se conservan en `arte/referencia-social-*-v0.12.0.webp`. Para reemplazar un afiche, guardar un WebP nuevo y actualizar su ruta y texto alternativo. Si cambia la proporción del material, ajustar el tamaño en `SocialWall.tsx`.

Los papeles del muro, las cintas y los tres afiches tienen capas separadas. Los afiches entran escalonados al llegar con el scroll. En escritorio, el cursor desplaza cada afiche a su propia velocidad y el papel se desplaza en sentido contrario. En móvil, el carrusel usa el desplazamiento nativo con ajuste por tarjeta, botones anterior y siguiente, y contador. El desplazamiento vertical conserva su gesto y el carrusel no solicita el sensor de inclinación. La preferencia de movimiento reducido omite las animaciones. `?movimiento=0#redes` abre una vista sin entrada ni parallax. Los enlaces tienen foco visible y los WebP cargan de forma diferida.

Las capturas de la versión 0.12.0 están en `arte/muro-social-escritorio-v0.12.0.png` y `arte/muro-social-movil-v0.12.0.png`.

### Dirección de arte de las imágenes

Las tres piezas se generaron con ImageGen integrado. Indicaciones usadas:

1. Photorealistic editorial old-school underground streetwear zine page, a standalone image asset for ROXWANA's social section, inspired by torn poster walls. Near square horizontal 7:6, camera directly over a physical paste-up of black, dirty cream and several muted vermilion photographic prints. Worn textured torn paper poster fragments, a dominant genuinely documentary analog photograph of a screen-printing squeegee and a single worker's hands in a Buenos Aires T-shirt workshop, seated black graphic cotton garment, smaller gritty abstract halftone fragments of the studio and crop marks. Low key late afternoon natural side lighting, imperfect 35mm grain, believable paper textures and details, dynamic graphic framing with large calm dark patches. Sleek art direction like an independent fashion magazine, colors black cream restrained red. Full bleed artwork, no outer margin or border, no website/UI, no title, writing, artificial logos, watermark, plastic CGI, dramatic effects or neon.
2. Standalone 7:6 landscape photograph of a physical magazine photo paste-up for Argentine indie streetwear brand ROXWANA's editorial social wall. The dominant photo features a real-looking twenty-something Buenos Aires streetwear woman in an off-white oversized T-shirt with a small abstract red and black graphic, silver hoops, dark hair in a messy ponytail, leaning against a concrete storefront looking off camera, quietly cool unforced attitude. Her face, natural skin, light freckles and garment realistically photographed, normal camera perspective 50mm, candid early evening soft flash and ambient side light, documentary style like a strong Instagram film photo. Layer on two smaller dark analog contact prints behind the main image, a walking streetwear man in black and a motion blurred city detail, plus one quiet red duotone strip. Real physical matte torn edges, inspiring magazine editorial negative space and restraint, black/tan/very muted oxblood palette with accurate skin colors. Full bleed paste-up, no graphic interface, lettering, brand marks, watermarks, beauty retouching, dramatic CGI or glossy advertising.
3. Photorealistic standalone near-square landscape 7:6 asset, analog fashion magazine moodboard for an independent Argentine rock streetwear brand. Top-down photograph of three overlapping physical authentic-looking instant photos and one 35mm contact strip pinned on black charcoal paper. Large instant photo: candid side angle of a young adult in an oversized black graphic tee and dark jeans, walking past a concrete wall, direct snap flash, tasteful motion blur on the edges. Mid-size instant photo of a different adult in a slate-blue graphic tee turned away beside a music-show venue door. Small detail photo of aged cotton and a warm red monochrome print. Cropped off-white instant-photo margins, small worn tan masking tape pieces, a plain charcoal pencil line, photoreal physical contact shadows on paper. Art directed like an independent fashion magazine but real candid photography, imperfect film scans, restrained touches of oxblood and slate blue, no prominent words, logos, title, frame around the entire asset, photography of screens, graphics UI or watermark. The full composition must work at small web size.


## Pie de página

El pie `#pie` cierra la página después del Muro Social. Usa el sello original de ROXWANA, dos titulares de papel con la misma base que los botones de Portada, accesos a Instagram y YouTube y un enlace a `#portada`. El texto y los enlaces están en `src/features/footer/SiteFooter.tsx`. La maqueta se adapta a una composición vertical en móvil.

El muro, el papel rojo, el guitarrista y los titulares son capas independientes. GSAP escalona la entrada y aplica distintos desplazamientos según el cursor. En móvil se puede arrastrar sobre la ilustración o activar la inclinación desde los controles del pie. Se usa el mismo ajuste de pausa que en Portada. La activación del sensor se hace en cada escena. Con movimiento reducido, la animación de entrada se omite y la inclinación activada manualmente tiene menor recorrido. El encuadre por encima de las rodillas se aplica en CSS.

Los WebP `pared-urbana-v0.13.0.webp` y `guitarrista-v0.13.0.webp` se guardan en `public/assets/footer/`. La pared y el guitarrista transparente se generaron por separado con ImageGen integrado. Indicaciones de generación:

1. Standalone widescreen 16:9 background artwork for an Argentine rock and streetwear website footer. A physical wall of layered torn underground concert-poster paper, black charcoal and faded warm ivory paper, xerox halftone textures and restrained saturated crimson ink streaks at the right corners. Photo collage of a worn Buenos Aires brutalist concrete urban building pushed to the far right edge, a tight naturally cropped vintage guitar amplifier at bottom right. The middle 65 percent is quiet deep charcoal charcoal paper with faint texture and no elements so separate typography cards can sit on it. Left dark with some grain for a separate guitarist cutout. Dense tactile scrapes and tears around the edges, a bold analogue punk zine look, photo-authentic grain, no gradients that look digital. Seamless edge-to-edge full bleed artwork, no hard framed edges, no layout panels, no people, no logo, no text or typography, no graphic interface. Cream and black dominate, crimson accents are concentrated at top right and along the lower edges.
2. Generate one isolated transparent-background cutout on a tall portrait canvas, for a punk-rock streetwear website collage. A male rock guitarist with untamed wavy shoulder-length hair, late twenties, black worn plain oversized tee, standing in an expressive natural performance pose, chin up and head tilted slightly backward with eyes closed and wind in hair, playing a vintage solid-body electric guitar. His torso faces the camera from a slightly low analog-photo angle, neck of guitar pointing diagonally to the upper right. Include the entire head, both hands, the complete headstock and guitar body, his full figure down to his boots, with generous clean padding on every side; no hard bottom truncation. Style: physically believable 1970s gig photograph printed in coarse dark charcoal and warm cream halftone on rough zine paper, dense blacks, restrained amber cream, dramatically lit but authentic proportions. Fine slightly torn cream edge hugging only the silhouette, background must be genuinely transparent alpha on all sides, clear detached silhouette. No stage, no scenery, no cast shadow outside silhouette, no rectangle, no letters, no logos, no other objects.


## WhatsApp

El acceso fijo a WhatsApp acompaña el desplazamiento de toda la página. El destino de contacto se configura en `src/WhatsAppLink.tsx` y usa el número configurado en el proyecto anterior de ROXWANA.


### Poses de agarre del probador

Las poses se editaron con ImageGen integrado a partir de la foto de cada modelo mirando hacia abajo. Los recursos transparentes están en `public/assets/probador/modelo-agarre-v0.14.0.webp` y `public/assets/probador/hombre-agarre-v0.14.0.webp`. Las guías y posiciones guardadas se mantienen por modelo. Indicaciones de generación:

1. Edit the attached cutout photograph of the adult female ROXWANA try-on model into ONE action frame of the very same person. This is an animation frame that must register with the reference: same centered frontal camera and crop, head at same position and tilt looking down at the shirt, same width of shoulders, necklace/clothes and tattoo, same lighting and purple rim, same waist and black-jeans crop at frame bottom, keep top margins. Change ONLY her arms and hands. Both hands are now completely out of her pockets, arms bent up, natural thumb and forefinger of each hand visibly gripping and slightly lifting the black tee fabric at the OUTER SIDE edges of the lower chest/upper abdomen, close to each side seam, just below the printing area. She studies the center of the tee with head down. Leave the central half-width of the T-shirt especially chest and stomach (x 26 to 74 percent of image) plain, smooth, black and uncovered by fingers for a digital print overlay. Make her elbows and wrists anatomically accurate, preserve black leather cuffs and left arm tattoo. Empty pockets. Exactly the same realistic photo, no lettering, logos, graphics or surroundings. Transparent background with real clean alpha, original vertical 520:738 framing, head through upper thighs, no floor and no thick glow around the edges.
2. Edit the attached cutout photograph of the adult male ROXWANA try-on model into ONE action frame of the very same person. Frame must register with reference: identical vertical 560:738 composition, straight frontal camera, head kept looking down at the center of his shirt in the same position and size, same shoulder heights and centered torso scale, same hair, face, silver chain, dark plain black short sleeve shirt and black jeans cut off at upper thigh, authentic warm studio lighting, same existing arm tattoos and leather cuffs. Change ONLY both arms and hands. Both hands are now completely out of his pockets, elbows bent, natural thumb and forefinger of each hand visibly pinch and slightly tug the black tee at the OUTER SIDE EDGES of his upper abdomen, just below and outside the chest art area, around horizontal coordinates x 23% and 77%, vertical y 64%. Leave the central half of the black T-shirt totally empty smooth and clearly visible for a separately overlaid print, no hands over sternum, no designs or lettering. Photoreal, human joint anatomy, clean real alpha background with no cast shadow, preserve existing neutral photography of the model. Single cutout frame rather than storyboard, preserve original crop and margins.


### Parpadeo del probador

Los dos modelos parpadean de forma automática con pausas irregulares mientras los ojos están a la vista. El parpadeo usa recortes de párpados que se superponen a la pose neutra. El primer parpadeo se muestra poco después de que se ven los ojos. Se pausa durante la reacción y al ocultar la pestaña. Con movimiento reducido se usa un cambio breve de fotograma sin fundido. Las posiciones están en `src/features/probador/artwork.ts` y el intervalo en `IdleBlink.tsx`.

Los recortes `modelo-parpadeo-v0.15.0.webp` y `hombre-parpadeo-v0.15.0.webp` se editaron con ImageGen integrado. Indicaciones de generación:

1. Edit this exact transparent cutout photograph to create ONE matched blink frame for an interactive avatar. The adult woman's eyelids are briefly closed naturally while her head is absolutely stationary, still tilted slightly back exactly as in the reference. Anatomically realistic relaxed skin and photographed natural eyelashes, no makeup changes. ONLY change the open eye apertures and immediately adjacent upper eyelids, keeping their original screen positions and the original eye corner to corner widths. Preserve the exact crop and aspect ratio, facial angle, cheeks, eyebrows, eyebrows height, forehead, nose bridge, skin color, illumination, face structure and head position. Preserve the entire unchanged pose, hair, jewelry, clothes and framing. Exact photographic registration between the old eye area and the edited one is essential; the edit will be masked to the eyelids only and shown for 105 ms. Genuine transparent outside silhouette. No smile, no lowering the head, no additional poses.
2. Edit this exact transparent cutout photograph to create ONE matched blink frame of the same adult male interactive model. Briefly close both eyelids naturally with head completely stationary still tilted up exactly as in the reference. ONLY change open eye apertures and immediately adjacent lids, keeping position and original width between eye corners. Keep head size and entire hair, eyebrows, mouth, nose, cheeks, skin color, lighting, depth, camera and crop absolutely identical. Preserve torso, clothes, arms, jewelry and body pose unchanged. Eyelid area will be masked and rendered for 105ms over the reference, so alignment should be pixel accurate. Realistic relaxed eyes, no squint or bending head, clean alpha outside silhouette, no new objects or text.


### Retrato de Descripción

`public/assets/pelirroja-cuclillas-v0.16.0.webp` contiene el recorte transparente de la referencia *Editorial de moda ROXWANA en cuclillas*. Se editó con ImageGen integrado. Indicación utilizada:

Precisely remove the background from this ROXWANA editorial reference image. Keep ONLY the existing red-haired adult model in the exact crouch and viewpoint, one knee raised, other leg folded, elbow on knee and fingers draped, looking at the camera. Preserve her exact likeness, freckled expression, red choppy hair and flyaways, earrings, plain beige ROXWANA tee with only its original small circular chest print, charcoal pants, and both complete original sneakers. Keep the precise proportions, anatomy, garment folds, coloration and photographic texture. Do not redraw, change facial expression, move the camera or alter the pose. Cropping may be closer around the silhouette but allow a small transparent margin on every side and under the entire front shoe. Remove all surrounding typography, logo in the design, papers, floor, cast shadow, backdrop, and color shapes. Output the isolated photograph with genuine clean alpha, carefully preserving loose hair and holes around limbs. No extra writing, gradient, border, or props.


### Modelo Niño

Abrir `/?modelo=nino#probador` para ver el modelo infantil. Sus diez estampas se importaron de `E:/estampas-roxwana/Trabajos` y quedan bajo `estampas/infantil` y `miniaturas/infantil`. Cada catálogo empieza con la remera lisa al pasar entre Niño y los modelos adultos. Los ajustes de Niño se guardan en `ajustes-nino.json`.

Los retratos y el recorte de párpados `nino-*-v0.17.0.webp` están en `public/assets/probador/`. Se prepararon con ImageGen integrado y comparten la misma composición por capas que los otros dos modelos. Indicaciones de generación:

1. Create the neutral frame of a photograph-based kids T-shirt try-on for ROXWANA. Use the reference for the same fictional school-age boy's identity, brown wavy hair and freckles, backwards black cap, black wristband on his right hand, loose black washed cotton tee and washed charcoal jeans. Put him directly FRONT ON, square to the camera, shoulders symmetrical and shirt front planar, head looking straight at lens with both eyes open and a relaxed expression, both hands naturally tucked into his own front jeans pockets. Keep a plain, entirely unprinted matte charcoal-black crew-neck T-shirt with very subtle folds near the hem and sleeves, large smooth clean chest for separately composited designs. Typical age-appropriate streetwear editorial, comfortable oversized clothes, quiet purple rim from the left and warm authentic diffuse portrait lighting, carefully realistic natural skin and proportions. Mid-thigh crop, complete hat and hair, both arms inside frame, roughly 3:4 portrait framing with small margin. Isolated clean cutout with true alpha background, no floor or shadow, no typography, logo, Spider-Man graphic, decals or environmental elements.
2. Create one animation pose from this exact alpha cutout of a fully clothed fictional school-age boy in a T-shirt try-on. Tilt only his head naturally forward to look DOWN at the middle of his own shirt, with his cap and hair following the tilt; keep the top of the head in the same vertical region. Direct frontal camera, shoulders and torso unchanged, both hands KEEP tucked in the pockets. Same boy, freckles, black backwards cap, color, wardrobe, rim light, scale, margins and thigh crop. Important: position around the neck and neckline remains consistent for compositing; the lowered head will be used as a separate layer. Entirely blank black crew-neck T-shirt. Real transparent alpha, no floor, props, writing or extra elements.
3. Edit this same fictional school-age boy's fully clothed frontal try-on photo into ONE gentle reaction frame with both hands OUT of his jeans pockets, elbows bent, with each thumb and index finger lightly touching the same plain charcoal-black T-shirt near its outside side seams at about upper abdomen level (x 26% and 74%, y 63% of the portrait). Keep the exact camera, same boy, head looking straight ahead, cap, freckles, lighting, cuffs (crown wristband on right hand), scale, thigh crop and clothes. Do not stretch the shirt or change the center panel; keep all decoration off the blank tee. This frame will be composited with a separate static shirt front and a lowered head, so preserve the torso spatial registration. Both fingers anatomically accurate, primary focal point on two subtle small touches. Keep true transparent alpha around silhouette, no floor or scenery.
4. Create a single blink frame for this same fictional boy by editing ONLY the eyes to briefly close the eyelids naturally. Head is completely stationary, frontal camera, same hair and backwards cap, same framing and exact alignment of eyes, eyebrows, facial expression, nose, lips, freckles, lighting and skin tone. The eyebrows and all pixels outside immediate upper and lower eyelids should stay unchanged. Keep the same fully clothed blank black T-shirt pose. Original image will be used for rest of face and body, this only supplies matched eyelid patches. True transparent alpha background.
