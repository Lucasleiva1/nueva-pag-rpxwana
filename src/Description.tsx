import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { brand, descriptionArt } from './heroAssets'
import '@fontsource/barlow/latin-500.css'
import './description.css'

export function Description() {
  const section = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (window.location.hash === '#descripcion') section.current?.scrollIntoView()
  }, [])

  const paper = { '--description-paper': 'url("' + descriptionArt.paper + '")' } as CSSProperties

  return (
    <section ref={section} id="descripcion" className="description" aria-labelledby="description-title" style={paper}>
      <div className="description-collage" aria-hidden="true" />
      <div className="description-visual">
        <img
          className="description-portrait"
          src={descriptionArt.portrait}
          alt="Modelo pelirroja con remera estampada de ROXWANA"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="description-frame">
        <div className="description-copy">
          <header className="description-masthead">
            <img src={brand.mark} width="51" height="38" alt="" />
            <span>Descripción</span>
          </header>
          <h2 id="description-title">
            <span>Remeras</span>
            <span>personalizadas</span>
          </h2>
          <p className="description-technique">Sublimación + DTF</p>
          <div className="description-body">
            <h3>Modelos listos y diseños a pedido</h3>
            <p>Hacemos remeras para marcas, negocios, eventos y uso personal. Podés elegir un diseño de ROXWANA, adaptar un modelo o traer tu propia idea para estampar.</p>
            <p>Estampamos con sublimación y DTF, según la tela y el diseño. Nuestra gráfica mezcla calle y rock, con contrastes fuertes y texturas.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
