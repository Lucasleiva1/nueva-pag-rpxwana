import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { brand, descriptionArt } from './heroAssets'
import { DescriptionListen } from './DescriptionListen'
import '@fontsource/barlow/latin-500.css'
import './description.css'

const descriptionTechnique = 'Sublimación + DTF'
const descriptionSubtitle = 'Modelos listos y diseños a pedido'
const descriptionIntro = 'Hacemos remeras para marcas, negocios, eventos y uso personal. Podés elegir un diseño de ROXWANA, adaptar un modelo o traer tu propia idea para estampar.'
const descriptionDetails = 'Estampamos con sublimación y DTF, según la tela y el diseño.'
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
          alt="Modelo pelirroja en cuclillas con una remera de ROXWANA"
          width="922"
          height="1448"
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
          <div className="description-title-row">
            <h2 id="description-title">
              <span>Remeras</span>
              <span>personalizadas</span>
            </h2>
            <DescriptionListen src={descriptionArt.narration} />
          </div>
          <p className="description-technique">{descriptionTechnique}</p>
          <div className="description-body">
            <h3>{descriptionSubtitle}</h3>
            <p>{descriptionIntro}</p>
            <p>{descriptionDetails}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
