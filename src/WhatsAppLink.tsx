import './whatsAppLink.css'

const contactMessage = 'Hola, hola Roxana. Quisiera saber el precio de las remeras personalizadas.'
export const contactUrl = 'https://wa.me/5491138893673?text=' + encodeURIComponent(contactMessage)

export function WhatsAppLink() {
  return (
    <a className="whatsapp-link" href={contactUrl} target="_blank" rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp" title="Escribinos por WhatsApp">
      <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round"
          d="M20.8 11.8a8.8 8.8 0 0 1-13 7.72L3.2 20.8l1.26-4.5A8.79 8.79 0 1 1 20.8 11.8Z" />
        <path fill="currentColor"
          d="M8.06 7.36c.36-.4.65-.45.96-.42.2.02.36.1.47.37l.82 1.91c.09.21.06.39-.08.57l-.62.75c-.13.15-.12.25-.03.41a8.08 8.08 0 0 0 3.45 2.99c.19.08.3.07.42-.08l.81-.99c.14-.17.28-.19.49-.1l1.91.9c.24.11.43.19.46.34.06.21-.04.95-.34 1.38-.36.5-1.26.87-1.93.83-1.46-.09-3.17-.88-4.88-2.4-1.48-1.34-2.53-2.86-2.59-4.23-.03-.76.21-1.53.68-2.23Z" />
      </svg>
    </a>
  )
}
